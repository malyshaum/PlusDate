<?php

namespace App\Events\Feed;

use App\Events\BroadcastsViaCentrifugoTrait;

class LikeEvent
{
    use BroadcastsViaCentrifugoTrait;

    public function __construct(
        private readonly int $userId,
    ) {}

    public function broadcastOn(): array
    {
        return ['#' . $this->userId];
    }

    public function broadcastAs(): string
    {
        return 'user.received_like';
    }

    public function broadcastWith(): array
    {
        return [
            'user_id' => $this->userId,
        ];
    }
}
