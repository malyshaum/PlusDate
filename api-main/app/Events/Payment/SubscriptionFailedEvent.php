<?php

namespace App\Events\Payment;

use App\Enums\Payment\SubscriptionTypeEnum;
use App\Events\BroadcastsViaCentrifugoTrait;
use Illuminate\Support\Carbon;

class SubscriptionFailedEvent
{
    use BroadcastsViaCentrifugoTrait;

    public function __construct(
        private readonly int $userId,
        private readonly string $paymentSystem,
        private readonly string $failureType,
        private readonly ?SubscriptionTypeEnum $subscriptionType = null,
        private readonly ?string $errorMessage = null,
        private readonly ?string $errorCode = null,
    ) {}

    public function broadcastOn(): array
    {
        return ['#' . $this->userId];
    }

    public function broadcastAs(): string
    {
        return 'subscription.failed';
    }

    public function broadcastWith(): array
    {
        return [
            'user_id' => $this->userId,
            'payment_system' => $this->paymentSystem,
            'failure_type' => $this->failureType,
            'subscription_type' => $this->subscriptionType?->value,
            'error_message' => $this->errorMessage,
            'error_code' => $this->errorCode,
            'timestamp' => Carbon::now()->toDateTimeString(),
        ];
    }

    public static function broadcast(
        int $userId,
        string $paymentSystem,
        string $failureType,
        ?SubscriptionTypeEnum $subscriptionType = null,
        ?string $errorMessage = null,
        ?string $errorCode = null,
    ): void {
        event(new self(
            $userId,
            $paymentSystem,
            $failureType,
            $subscriptionType,
            $errorMessage,
            $errorCode
        ));
    }
}
