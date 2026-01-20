<?php

namespace App\Enums\Telegram;

use App\Enums\BaseEnumTrait;

enum TelegramMessageEnum: string
{
    use BaseEnumTrait;

    case MODERATION_BEGIN_MESSAGE = 'moderation_begin_message';
    case MODERATION_FAILED_MESSAGE = 'moderation_failed_message';
    case MODERATION_SUCCESS_MESSAGE = 'moderation_success_message';
    case PHOTO_UPDATE_MODERATION_START_MESSAGE = 'photo_update_moderation_start_message';
    case PHOTO_UPDATE_MODERATION_SUCCESS_MESSAGE = 'photo_update_moderation_success_message';
    case PHOTO_UPDATE_MODERATION_FAIL_MESSAGE = 'photo_update_moderation_fail_message';
    case PREMIUM_STARTED_MESSAGE = 'premium_started_message';
    case PREMIUM_EXPIRED_MESSAGE = 'premium_expired_message';
    case ACCOUNT_DELETED_BY_ADMIN_MESSAGE = 'account_deleted_by_admin_message';
    case OPEN_APP_BUTTON_TEXT = 'open_app_button_text';
}
