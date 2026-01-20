<?php

namespace App\Enums\Telegram;

use App\Enums\BaseEnumTrait;

enum BotNotificationTypeEnum: string
{
    use BaseEnumTrait;

    case LIKES = 'likes';
    case MESSAGES = 'messages';
    case MATCHES = 'matches';
}
