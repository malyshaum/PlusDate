<?php

declare(strict_types=1);

namespace App\Enums\Telegram;

use App\Enums\BaseEnumTrait;

enum TelegramChatMemberStatusEnum: string
{
    use BaseEnumTrait;

    case CREATOR = 'creator';
    case ADMINISTRATOR = 'administrator';
    case MEMBER = 'member';
    case RESTRICTED = 'restricted';
    case LEFT = 'left';
    case KICKED = 'kicked';
}
