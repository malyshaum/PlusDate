<?php

namespace App\Services\User;

use App\Enums\Core\GenderEnum;
use App\Enums\Core\SwipeActionEnum;
use App\Models\User\UserFeedProfile;
use App\Models\User\UserSwipe;
use App\Models\User\UserSwipeState;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

readonly class SwipeLimitService
{
    private const int CACHE_TTL = 300; // 5 minutes
    private const int UNLIMITED_LIMIT = 9999;

    public function __construct(
        private SwipeLimitConfigService $configService,
    ) {
    }

    public function getAvailableSwipes(int $userId, bool $isPremium, string $gender): array
    {
        if ($isPremium) {
            return $this->getUnlimitedSwipes($userId);
        }

        if ($gender === GenderEnum::FEMALE->value) {
            return $this->getUnlimitedSwipes($userId);
        }

        return $this->calculateAvailableSwipes($userId);
    }

    public function canSwipe(int $userId, SwipeActionEnum $action, bool $isPremium, bool $isRespond = false): bool
    {
        if ($isRespond) {
            return true;
        }

        if ($action === SwipeActionEnum::DISLIKE) {
            return true;
        }

        /** @var UserFeedProfile $userProfile */
        $userProfile = UserFeedProfile::query()
            ->where('user_id', $userId)
            ->firstOrFail();

        $swipeData = $this->getAvailableSwipes($userId, $isPremium, $userProfile->sex);

        if ($action === SwipeActionEnum::LIKE) {
            return $swipeData['likes'] < $swipeData['likes_day_limit'];
        }

        if ($action === SwipeActionEnum::SUPERLIKE) {
            return $swipeData['superlikes'] < $swipeData['superlikes_day_limit'];
        }

        return false;
    }

    public function recordSwipeUsage(int $userId, SwipeActionEnum $action): void
    {
        if ($action === SwipeActionEnum::DISLIKE) {
            return;
        }

        $state = UserSwipeState::query()->where('user_id', $userId)->first();

        if (!$state) {
            $this->initializeUserState($userId);
            $state = UserSwipeState::query()->where('user_id', $userId)->first();
        }

        $state->increment('swipes_used_in_phase');

        $state->refresh();

        if ($this->shouldTransitionPhase($state)) {
            $state->update(['phase_started_at' => Carbon::now()]);
        }

        $this->clearUserCache($userId);
    }

    public function initializeUserState(int $userId): void
    {
        UserSwipeState::query()->firstOrCreate([
            'user_id' => $userId
        ],[
            'current_phase' => 'initial',
            'phase_started_at' => Carbon::now(),
            'swipes_used_in_phase' => 0,
        ]);

        $this->clearUserCache($userId);
    }

    public function transitionPhase(int $userId): void
    {
        $state = UserSwipeState::query()->where('user_id', $userId)->lockForUpdate()->first();

        if (!$state) {
            return;
        }

        $nextPhase = $this->getNextPhase($state->current_phase);

        $state->update([
            'current_phase' => $nextPhase,
            'phase_started_at' => Carbon::now(),
            'swipes_used_in_phase' => 0,
        ]);

        $this->clearUserCache($userId);
    }

    private function calculateAvailableSwipes(int $userId): array
    {
        $state = UserSwipeState::query()->where('user_id', $userId)->first();

        if (!$state) {
            $this->initializeUserState($userId);
            $state = UserSwipeState::query()->where('user_id', $userId)->first();
        }

        $phaseLimit = $this->getPhaseLimit($state->current_phase);
        $cooldownHours = $this->configService->getConfig('cooldown_hours', 6);

        $swipesUsed = $state->swipes_used_in_phase;
        $swipesRemaining = max(0, $phaseLimit - $swipesUsed);

        $cooldownEndsAt = null;
        $isOnCooldown = false;

        if ($swipesRemaining === 0 && $state->phase_started_at) {
            $cooldownEndsAt = $state->phase_started_at->copy()->addHours($cooldownHours);
            $isOnCooldown = Carbon::now()->lt($cooldownEndsAt);

            if (!$isOnCooldown) {
                $this->transitionPhase($userId);
                return $this->calculateAvailableSwipes($userId);
            }
        }

        $superlikesUsed = UserSwipe::query()
            ->where('user_id', $userId)
            ->where('action', SwipeActionEnum::SUPERLIKE->value)
            ->whereDate('created_at', Carbon::today())
            ->count();

        $superlikeLimit = $this->configService->getConfig('free_superlike_limit', 0);

        return [
            'likes' => $swipesUsed,
            'likes_day_limit' => $phaseLimit,
            'superlikes' => $superlikesUsed,
            'superlikes_day_limit' => $superlikeLimit,
            'current_phase' => $state->current_phase,
            'cooldown_ends_at' => $cooldownEndsAt?->toDateTimeString(),
            'is_on_cooldown' => $isOnCooldown,
        ];
    }

    private function getUnlimitedSwipes(int $userId): array
    {
        $result = DB::table('user_swipes')
            ->where('user_id', $userId)
            ->whereDate('created_at', Carbon::today())
            ->selectRaw('
                COUNT(CASE WHEN action = ? THEN 1 END) as likes,
                COUNT(CASE WHEN action = ? THEN 1 END) as superlikes
            ', [SwipeActionEnum::LIKE->value, SwipeActionEnum::SUPERLIKE->value])
            ->first();

        $superlikeLimit = $this->configService->getConfig('premium_superlike_limit', 5);

        return [
            'likes' => $result->likes ?? 0,
            'likes_day_limit' => self::UNLIMITED_LIMIT,
            'superlikes' => $result->superlikes ?? 0,
            'superlikes_day_limit' => $superlikeLimit,
        ];
    }

    private function getPhaseLimit(string $phase): int
    {
        return match ($phase) {
            'initial' => $this->configService->getConfig('free_male_initial_swipes', 100),
            'phase2' => $this->configService->getConfig('free_male_phase2_swipes', 50),
            'phase3' => $this->configService->getConfig('free_male_phase3_swipes', 25),
            'cooldown' => $this->configService->getConfig('free_male_cooldown_swipes', 25),
            default => 0,
        };
    }

    private function getNextPhase(string $currentPhase): string
    {
        return match ($currentPhase) {
            'initial' => 'phase2',
            'phase2' => 'phase3',
            default => 'cooldown',
        };
    }

    private function shouldTransitionPhase(UserSwipeState $state): bool
    {
        $phaseLimit = $this->getPhaseLimit($state->current_phase);
        return $state->swipes_used_in_phase >= $phaseLimit;
    }

    private function clearUserCache(int $userId): void
    {
        Cache::forget("swipe_limits:user:{$userId}:state");
        Cache::forget("swipe_limits:user:{$userId}:available");
    }
}
