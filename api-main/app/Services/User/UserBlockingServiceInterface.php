<?php

declare(strict_types=1);

namespace App\Services\User;

interface UserBlockingServiceInterface
{
    public function blockUser(int $userId, int $blockedUserId): void;

    public function unblockUser(int $userId, int $blockedUserId): void;
}
