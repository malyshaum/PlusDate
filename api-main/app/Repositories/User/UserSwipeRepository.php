<?php

declare(strict_types=1);

namespace App\Repositories\User;

use App\Models\User\UserFeedProfile;
use App\Models\User\UserSwipe;
use Illuminate\Support\Facades\Log;

readonly class UserSwipeRepository implements UserSwipeRepositoryInterface
{
    public function softDeleteSwipesBetweenUsers(int $userId, int $blockedUserId): void
    {
        $profile1 = $this->findProfile($userId);
        $profile2 = $this->findProfile($blockedUserId);

        if ($profile1 === null || $profile2 === null) {
            return;
        }

        UserSwipe::query()
            ->where(function ($query) use ($userId, $profile2) {
                $query->where('user_id', $userId)
                    ->where('profile_id', $profile2->id);
            })
            ->orWhere(function ($query) use ($blockedUserId, $profile1) {
                $query->where('user_id', $blockedUserId)
                    ->where('profile_id', $profile1->id);
            })
            ->delete();
    }

    public function restoreSwipesBetweenUsers(int $userId, int $blockedUserId): void
    {
        $profile1 = $this->findProfile($userId);
        $profile2 = $this->findProfile($blockedUserId);

        if ($profile1 === null || $profile2 === null) {
            return;
        }

        UserSwipe::query()
            ->withTrashed()
            ->where(function ($query) use ($userId, $profile2) {
                $query->where('user_id', $userId)
                    ->where('profile_id', $profile2->id);
            })
            ->orWhere(function ($query) use ($blockedUserId, $profile1) {
                $query->where('user_id', $blockedUserId)
                    ->where('profile_id', $profile1->id);
            })
            ->restore();
    }

    private function findProfile(int $userId): ?UserFeedProfile
    {
        return UserFeedProfile::where('user_id', $userId)->first();
    }
}
