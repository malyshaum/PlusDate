<?php

namespace App\Services\Subscription;

use App\Enums\Payment\SubscriptionDriverEnum;
use App\Services\Subscription\Contracts\SubscriptionDriver;
use App\Services\Subscription\Drivers\StripeSubscriptionDriver;
use App\Services\Subscription\Drivers\TelegramSubscriptionDriver;
use InvalidArgumentException;

final readonly class SubscriptionManager
{
    public function __construct(
        private StripeSubscriptionDriver $stripe,
        private TelegramSubscriptionDriver $telegram,
    ) {}

    public function driver(SubscriptionDriverEnum $type): SubscriptionDriver
    {
        return match ($type) {
            SubscriptionDriverEnum::STRIPE => $this->stripe,
            SubscriptionDriverEnum::TELEGRAM => $this->telegram,
        };
    }
}
