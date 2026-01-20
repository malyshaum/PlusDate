<?php

namespace App\Enums\Payment;

use App\Enums\BaseEnumTrait;

enum PaymentStatusEnum: string
{
    use BaseEnumTrait;

    case SUCCESS = 'success';
    case FAIL = 'fail';
}
