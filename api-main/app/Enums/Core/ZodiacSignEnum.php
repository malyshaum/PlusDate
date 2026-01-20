<?php

namespace App\Enums\Core;

use App\Enums\BaseEnumTrait;

enum ZodiacSignEnum: string
{
    use BaseEnumTrait;

    case ARIES = 'aries';
    case TAURUS = 'taurus';
    case GEMINI = 'gemini';
    case CANCER = 'cancer';
    case LEO = 'leo';
    case VIRGO = 'virgo';
    case LIBRA = 'libra';
    case SCORPIO = 'scorpio';
    case SAGITTARIUS = 'sagittarius';
    case CAPRICORN = 'capricorn';
    case AQUARIUS = 'aquarius';
    case PISCES = 'pisces';
}
