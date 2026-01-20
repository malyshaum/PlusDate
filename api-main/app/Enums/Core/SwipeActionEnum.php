<?php

namespace App\Enums\Core;

use App\Enums\BaseEnumTrait;

enum SwipeActionEnum: string
{
    use BaseEnumTrait;

    case LIKE = 'like';
    case DISLIKE = 'dislike';
    case SUPERLIKE = 'superlike';
}