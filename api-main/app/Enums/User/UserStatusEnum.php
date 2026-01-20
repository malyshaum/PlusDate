<?php

declare(strict_types=1);

namespace App\Enums\User;

use App\Enums\BaseEnumTrait;

enum UserStatusEnum: string
{
    use BaseEnumTrait;

    case ACTIVE = 'active';
    case BLOCKED = 'blocked';
}
