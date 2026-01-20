<?php

namespace App\Enums\Core;

use App\Enums\BaseEnumTrait;

enum EyeColorEnum: string
{
    use BaseEnumTrait;

    case GREEN = 'green';
    case YELLOW = 'yellow';
    case BLUE = 'blue';
    case GREY = 'grey';
    case BROWN = 'brown';
}
