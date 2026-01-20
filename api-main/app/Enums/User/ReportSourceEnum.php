<?php

namespace App\Enums\User;

use App\Enums\BaseEnumTrait;

enum ReportSourceEnum: string
{
    use BaseEnumTrait;

    case SWIPE_FEED = 'swipe_feed';
    case PROFILE = 'profile';
    case CHAT = 'chat';
    case CHAT_PROFILE = 'chat_profile';
    case LIKE_PROFILE = 'like_profile';
}
