<?php

namespace App\Enums\Telegram;

use App\Enums\BaseEnumTrait;

enum NotificationNavigationEnum: string
{
    use BaseEnumTrait;

    case LIKES = 'likes';
    case MESSAGES = 'messages';
    case MATCH = 'match';
}
