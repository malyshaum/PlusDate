<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Chat;
use App\Models\Chat\ChatUser;
use Illuminate\Support\Facades\Log;

readonly class ChatRepository implements ChatRepositoryInterface
{
    public function softDeleteChatsByUserId(int $userId): void
    {
        Chat::query()
            ->whereHas('users', fn($q) => $q->where('user_id', $userId))
            ->delete();
    }

    public function softDeleteChatsBetweenUsers(int $userId, int $blockedUserId): void
    {
        $chatId = $this->getUsersChatId($userId, $blockedUserId);
        if ($chatId === null) {
            return;
        }

        Chat::query()
            ->where('id', $chatId)
            ->delete();
    }

    public function restoreChatsBetweenUsers(int $userId, int $blockedUserId): void
    {
        $chatId = $this->getUsersChatId($userId, $blockedUserId);
        if ($chatId === null) {
            return;
        }

        Chat::query()
            ->withTrashed()
            ->where('id', $chatId)
            ->restore();
    }

    private function getUsersChatId(int $userId, int $secondUserId): ?int
    {
        return ChatUser::query()
            ->select('chat_id')
            ->whereIn('user_id', [$userId, $secondUserId])
            ->groupBy('chat_id')
            ->havingRaw('COUNT(DISTINCT user_id) = 2') //to sure that it is a chat only of this 2 users
            ->value('chat_id');
    }
}
