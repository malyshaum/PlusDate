<?php

namespace App\Events\Moderation;

use App\Dto\User\UserDto;
use App\Enums\Moderation\RejectionReasonEnum;
use App\Events\BroadcastsViaCentrifugoTrait;

class PhotoModerationResultEvent
{
    use BroadcastsViaCentrifugoTrait;

    public function __construct(
        private readonly UserDto $userDto,
        private readonly RejectionReasonEnum|null $rejectionReason = null,
    ) {}

    public function broadcastOn(): array
    {
        return ['#' . $this->userDto->id];
    }

    public function broadcastAs(): string
    {
        return 'photo.moderation.result';
    }

    public function broadcastWith(): array
    {
        return [
            'is_rejected' => (bool)$this->rejectionReason,
            'rejection_reason' => $this->rejectionReason?->value,
        ];
    }
}
