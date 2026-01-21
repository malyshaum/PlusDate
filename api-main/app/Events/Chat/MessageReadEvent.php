<?php

namespace App\Events\Chat;

use App\Events\BroadcastsViaCentrifugoTrait;

class MessageReadEvent
{
    use BroadcastsViaCentrifugoTrait;

    public function __construct(
        private readonly int $messageId,
        private readonly int $userId,
        private readonly int $chatId,
    ) {}

    public function broadcastOn(): array
    {
        return ['#' . $this->userId];
    }

    public function broadcastAs(): string
    {
        return 'message.read';
    }

    public function broadcastWith(): array
    {
        return [
            'message_id' => $this->messageId,
            'chat_id' => $this->chatId,
        ];
    }
}
