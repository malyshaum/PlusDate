<?php

namespace App\Services\User;

use App\Models\User\UserFeedProfile;
use App\Models\User\UserSwipe;
use Illuminate\Support\Facades\Cache;

class PresenceService
{
    private const int TTL = 30;

    public function getOnlineMatchUserIds(int $userId): array
    {
        $this->markOnline($userId);

        $matchedUserIds = $this->getMatchedUserIds($userId);

        $onlineIds = [];
        foreach ($matchedUserIds as $matchedUserId) {
            if (Cache::has("user:{$matchedUserId}:online")) {
                $onlineIds[] = $matchedUserId;
            }
        }

        return $onlineIds;
    }

    private function markOnline(int $userId): void
    {
        Cache::put("user:{$userId}:online", 1, self::TTL);
    }

    private function getMatchedUserIds(int $userId): array
    {
        $profileIds = UserSwipe::query()
            ->where('user_id', $userId)
            ->where('is_match', true)
            ->pluck('profile_id');

        if ($profileIds->isEmpty()) {
            return [];
        }

        return UserFeedProfile::query()
            ->whereIn('id', $profileIds)
            ->pluck('user_id')
            ->toArray();
    }
}
