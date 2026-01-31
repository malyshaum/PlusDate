<?php

namespace App\Rules\Feed;

use App\Enums\Core\ErrorMessageEnum;
use App\Enums\Core\SwipeActionEnum;
use App\Models\User;
use App\Rules\BaseRule;
use App\Services\User\SwipeLimitService;
use App\Services\User\UserService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

// TODO: maybe we can remove feed_profile checks at all
class CanSwipeProfileRule extends BaseRule
{
    protected string $message = ErrorMessageEnum::VALIDATION_SWIPE_ALREADY_EXISTS->value;

    public function __construct(
        private readonly SwipeLimitService  $swipeLimitService,
    )
    {

    }

    public function passes($attribute, $value): bool
    {
        $actionType = SwipeActionEnum::from($this->data['action']);

        if ($actionType === SwipeActionEnum::DISLIKE) {
            return true;
        }

        $user = User::query()
            ->select(['id', 'is_premium'])
            ->with('feedProfile:user_id,sex')
            ->where('id', $this->data['user_id'])
            ->firstOrFail();

        $isRespond = $this->context['respond'] ?? false;

        if ($isRespond && !$user->is_premium) {
            $this->message = ErrorMessageEnum::VALIDATION_PREMIUM_REQUIRED->value;
            return false;
        }

        $canSwipe = $this->swipeLimitService->canSwipe(
            $this->data['user_id'],
            $actionType,
            $user->is_premium,
            $isRespond
        );

        if (!$canSwipe) {
            $this->message = ErrorMessageEnum::VALIDATION_SWIPES_DAY_LIMIT_REACHED->value;
            return false;
        }

        $profileExists = DB::table('user_feed_profile')
            ->where('id', (int)$value)
            ->exists();

        if ($profileExists === false) {
            $this->message = ErrorMessageEnum::VALIDATION_USER_DOES_NOT_HAVE_FEED_PROFILE->value;
            return false;
        }

        $currentUserProfile = DB::table('user_feed_profile')
            ->where('user_id', $this->data['user_id'])
            ->exists();

        if ($currentUserProfile === false) {
            $this->message = ErrorMessageEnum::VALIDATION_USER_DOES_NOT_HAVE_FEED_PROFILE->value;
            return false;
        }

        if (!$isRespond) {
            $swipeExists = DB::table('user_swipes')
                ->where('user_id', $this->data['user_id'])
                ->where('profile_id', (int)$value)
                ->where('action', '!=', SwipeActionEnum::DISLIKE->value)
                ->exists();

            if ($swipeExists) {
                return false;
            }
        }

        return true;
    }
}
