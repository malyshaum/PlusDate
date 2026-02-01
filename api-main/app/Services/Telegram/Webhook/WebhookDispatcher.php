<?php

declare(strict_types=1);

namespace App\Services\Telegram\Webhook;

use App\Enums\Telegram\TelegramWebhookUpdateTypeEnum;

readonly class WebhookDispatcher
{
    public function __construct(
        private PreCheckoutQueryHandler $preCheckoutQueryHandler,
        private SuccessfulPaymentHandler $successfulPaymentHandler,
        private WebAppDataHandler $webAppDataHandler,
        private MyChatMemberHandler $myChatMemberHandler,
        private CommandsHandler $commandsHandler,
    ) {
    }

    public function dispatch(WebhookCriteria $criteria): void
    {
        switch ($criteria->updateType) {
            case TelegramWebhookUpdateTypeEnum::PRE_CHECKOUT_QUERY:
                $this->preCheckoutQueryHandler->handle($criteria->preCheckoutQuery);
                break;
            case TelegramWebhookUpdateTypeEnum::SUCCESSFUL_PAYMENT:
                $this->successfulPaymentHandler->handle($criteria->message);
                break;
            case TelegramWebhookUpdateTypeEnum::WEB_APP_DATA:
                $this->webAppDataHandler->handle($criteria->message);
                break;
            case TelegramWebhookUpdateTypeEnum::MY_CHAT_MEMBER:
                $this->myChatMemberHandler->handle($criteria->myChatMember);
                break;
            case TelegramWebhookUpdateTypeEnum::COMMANDS:
                $this->commandsHandler->handle($criteria->requestData);
                break;
        }
    }
}
