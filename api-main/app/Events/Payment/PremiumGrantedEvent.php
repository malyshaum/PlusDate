<?php

namespace App\Events\Payment;

use App\Enums\Payment\SubscriptionTypeEnum;
use App\Events\BroadcastsViaCentrifugoTrait;
use Illuminate\Support\Carbon;

class PremiumGrantedEvent
{
    use BroadcastsViaCentrifugoTrait;

    public function __construct(
        private readonly int $userId,
        private readonly SubscriptionTypeEnum $subscriptionType,
        private readonly Carbon|null $activeUntil = null,
    ) {}

    public function broadcastOn(): array
    {
        return ['#' . $this->userId];
    }

    public function broadcastAs(): string
    {
        return 'premium.granted';
    }

    public function broadcastWith(): array
    {
        return [
            'user_id' => $this->userId,
            'is_premium' => true,
            'subscription_type' => $this->subscriptionType->value,
            'active_until' => $this->activeUntil?->toDateTimeString(),
            'timestamp' => Carbon::now()->toDateTimeString(),
        ];
    }
}
