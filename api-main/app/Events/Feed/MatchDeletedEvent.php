<?php

namespace App\Events\Feed;

use App\Events\BroadcastsViaCentrifugoTrait;

class MatchDeletedEvent
{
    use BroadcastsViaCentrifugoTrait;

    public function __construct(
        private readonly int $userIdToSendEvent,
        private readonly int $userId,
    ) {}

    public function broadcastOn(): array
    {
        return ['#' . $this->userIdToSendEvent];
    }

    public function broadcastAs(): string
    {
        return 'user.match_deleted';
    }

    public function broadcastWith(): array
    {
        return [
            'user_id' => $this->userId,
        ];
    }
}
