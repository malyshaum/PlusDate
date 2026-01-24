<?php

namespace App\Jobs\Notification;

use App\Enums\Telegram\BotNotificationTypeEnum;
use App\Services\Notification\NotificationService;
use AutoMapperPlus\Exception\UnregisteredMappingException;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class UserBotNotification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly int $userId,
        private readonly BotNotificationTypeEnum $botNotificationType,
        private readonly ?int $chatId = null,
    )
    {

    }

    /**
     * @throws UnregisteredMappingException
     */
    public function handle(
        NotificationService $notificationService,
    ): void
    {
        $notificationService->notifyIfNeeded($this->userId, $this->botNotificationType, $this->chatId);
    }
}
