<?php

namespace App\Enums\Core;

use App\Enums\BaseEnumTrait;

enum LanguageCodeEnum: string
{
    use BaseEnumTrait;

    case EN = 'en';
    case RU = 'ru';
}
