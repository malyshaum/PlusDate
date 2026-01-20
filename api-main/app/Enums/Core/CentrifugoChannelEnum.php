<?php

namespace App\Enums\Core;

use App\Enums\BaseEnumTrait;

enum CentrifugoChannelEnum: string
{
    use BaseEnumTrait;

    case STATUS = 'status';
}
