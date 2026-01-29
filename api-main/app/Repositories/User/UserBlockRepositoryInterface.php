<?php

declare(strict_types=1);

namespace App\Repositories\User;

interface UserBlockRepositoryInterface
{
    public function blockUser(int $userId, int $blockedUserId): void;

    public function unblockUser(int $userId, int $blockedUserId): void;

    public function isBlocked(int $userId, int $blockedUserId): bool;

    public function getBlockedUserIds(int $userId): array;
}
