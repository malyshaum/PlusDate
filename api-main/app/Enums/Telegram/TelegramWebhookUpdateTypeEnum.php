<?php

declare(strict_types=1);

namespace App\Enums\Telegram;

use App\Enums\BaseEnumTrait;

enum TelegramWebhookUpdateTypeEnum: string
{
    use BaseEnumTrait;

    case PRE_CHECKOUT_QUERY = 'pre_checkout_query';
    case SUCCESSFUL_PAYMENT = 'message.successful_payment';
    case WEB_APP_DATA = 'message.web_app_data';
    case MY_CHAT_MEMBER = 'my_chat_member';
    case COMMANDS = 'commands';
}
