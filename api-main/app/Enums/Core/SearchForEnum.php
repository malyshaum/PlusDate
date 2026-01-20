<?php

namespace App\Enums\Core;

use App\Enums\BaseEnumTrait;

enum SearchForEnum: string
{
    use BaseEnumTrait;
    case RELATIONS = 'relations';
    case FRIENDS = 'friends';
    case NO_ANSWER = 'no_answer';
}
