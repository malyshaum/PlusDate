<?php

declare(strict_types=1);

namespace App\Repositories\User;

use App\Models\User\UserBlock;
use Illuminate\Support\Facades\Log;

readonly class UserBlockRepository implements UserBlockRepositoryInterface
{
    public function blockUser(int $userId, int $blockedUserId): void
    {
        UserBlock::query()->firstOrCreate([
            'user_id' => $userId,
            'blocked_user_id' => $blockedUserId,
        ]);
    }

    public function unblockUser(int $userId, int $blockedUserId): void
    {
        UserBlock::query()
            ->where('user_id', $userId)
            ->where('blocked_user_id', $blockedUserId)
            ->delete();
    }

    public function isBlocked(int $userId, int $blockedUserId): bool
    {
        return UserBlock::query()
            ->where('user_id', $userId)
            ->where('blocked_user_id', $blockedUserId)
            ->exists();
    }

    public function getBlockedUserIds(int $userId): array
    {
        return UserBlock::query()
            ->where('user_id', $userId)
            ->pluck('blocked_user_id')
            ->toArray();
    }
}
