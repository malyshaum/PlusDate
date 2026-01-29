<?php

declare(strict_types=1);

namespace App\Repositories\User;

interface UserSwipeRepositoryInterface
{
    public function softDeleteSwipesBetweenUsers(int $userId, int $blockedUserId): void;

    public function restoreSwipesBetweenUsers(int $userId, int $blockedUserId): void;
}
