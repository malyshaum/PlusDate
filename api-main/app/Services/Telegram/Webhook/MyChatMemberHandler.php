<?php

declare(strict_types=1);

namespace App\Services\Telegram\Webhook;

use App\Enums\Telegram\TelegramChatMemberStatusEnum;
use App\Repositories\UserRepository;

readonly class MyChatMemberHandler
{
    public function __construct(
        private UserRepository $userRepository,
    )
    {

    }
    public function handle(array $myChatMember): void
    {
        $chat = $myChatMember['chat'] ?? null;
        $newChatMember = $myChatMember['new_chat_member'] ?? null;

        if (!$chat || !$newChatMember) {
            return;
        }

        $userId = (int)($chat['id'] ?? null);
        $statusEnum = TelegramChatMemberStatusEnum::tryFrom($newChatMember['status'] ?? null);

        if (!$userId || !$statusEnum) {
            return;
        }

        if ($statusEnum === TelegramChatMemberStatusEnum::KICKED) {
            $this->userRepository->updateKickedBotStatus($userId);
        }

        if ($statusEnum === TelegramChatMemberStatusEnum::MEMBER) {
            $this->userRepository->unblockBotStatus($userId);
        }
    }
}
