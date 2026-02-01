<?php

declare(strict_types=1);

namespace App\Services\Telegram\Webhook;

use App\Enums\Telegram\TelegramWebhookUpdateTypeEnum;

readonly class WebhookCriteria
{
    public function __construct(
        public TelegramWebhookUpdateTypeEnum $updateType,
        public array $preCheckoutQuery = [],
        public array $message = [],
        public array $myChatMember = [],
        public array $requestData = [],
    ) {
    }
}
