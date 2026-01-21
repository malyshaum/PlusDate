<?php

namespace App\Events\Moderation;

use App\Dto\User\UserDto;
use App\Enums\Moderation\RejectionReasonEnum;
use App\Events\BroadcastsViaCentrifugoTrait;
use Illuminate\Support\Carbon;

class ModerationStatusUpdatedEvent
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
        return 'moderation.status.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'is_rejected' => (bool)$this->rejectionReason,
            'rejection_reason' => $this->rejectionReason?->value,
            'timestamp' => Carbon::now(),
        ];
    }
}
