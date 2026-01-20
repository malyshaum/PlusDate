<?php

declare(strict_types=1);

namespace App\Enums\Payment;

use App\Enums\BaseEnumTrait;

enum SubscriptionDriverEnum: string
{
    use BaseEnumTrait;

    case STRIPE = 'stripe';
    case TELEGRAM = 'telegram';
}
