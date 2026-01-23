<?php

declare(strict_types=1);

namespace App\Http\Requests\Bot;

use App\Enums\Telegram\TelegramWebhookUpdateTypeEnum;
use App\Services\Telegram\Webhook\WebhookCriteria;
use Illuminate\Foundation\Http\FormRequest;

final class TelegramWebhookRequest extends FormRequest
{
    public function getUpdateType(): TelegramWebhookUpdateTypeEnum
    {
        if ($this->has(TelegramWebhookUpdateTypeEnum::PRE_CHECKOUT_QUERY->value)) {
            return TelegramWebhookUpdateTypeEnum::PRE_CHECKOUT_QUERY;
        }

        if ($this->has(TelegramWebhookUpdateTypeEnum::SUCCESSFUL_PAYMENT->value)) {
            return TelegramWebhookUpdateTypeEnum::SUCCESSFUL_PAYMENT;
        }

        if ($this->has(TelegramWebhookUpdateTypeEnum::WEB_APP_DATA->value)) {
            return TelegramWebhookUpdateTypeEnum::WEB_APP_DATA;
        }

        if ($this->has(TelegramWebhookUpdateTypeEnum::MY_CHAT_MEMBER->value)) {
            return TelegramWebhookUpdateTypeEnum::MY_CHAT_MEMBER;
        }

        return TelegramWebhookUpdateTypeEnum::COMMANDS;
    }

    public function makeCriteria(): WebhookCriteria
    {
        $updateType = $this->getUpdateType();
        $requestData = $this->all();

        return new WebhookCriteria(
            updateType: $updateType,
            preCheckoutQuery: $requestData['pre_checkout_query'] ?? [],
            message: $requestData['message'] ?? [],
            myChatMember: $requestData['my_chat_member'] ?? [],
            requestData: $requestData,
        );
    }
}
