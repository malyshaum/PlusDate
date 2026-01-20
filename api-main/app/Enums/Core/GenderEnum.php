<?php

namespace App\Enums\Core;

use App\Enums\BaseEnumTrait;

enum GenderEnum: string
{
    use BaseEnumTrait;

    case MALE = 'male';
    case FEMALE = 'female';
}
