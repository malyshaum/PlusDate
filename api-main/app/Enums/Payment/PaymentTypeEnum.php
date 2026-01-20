<?php

namespace App\Enums\Payment;

use App\Enums\BaseEnumTrait;

enum PaymentTypeEnum: string
{
    use BaseEnumTrait;

    case TELEGRAM = 'telegram';
    case STRIPE = 'stripe';
    case TRIBUTE = 'tribute';
}
