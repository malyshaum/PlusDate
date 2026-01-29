<?php

declare(strict_types=1);

namespace App\Repositories;

interface ChatRepositoryInterface
{
    public function softDeleteChatsByUserId(int $userId): void;

    public function softDeleteChatsBetweenUsers(int $userId, int $blockedUserId): void;

    public function restoreChatsBetweenUsers(int $userId, int $blockedUserId): void;
}
