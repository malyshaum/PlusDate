<?php

namespace App\Jobs\Moderation;

use App\Clients\RabbitMQClient;
use App\Dto\User\UserDto;
use App\Enums\Telegram\TelegramMessageEnum;
use App\Exceptions\ApiException;
use App\Services\TelegramService;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class ValidateUserProfileJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        private readonly UserDto $userDto,
    )
    {
        //
    }

    /**
     * @throws ApiException
     * @throws Exception
     */
    public function handle(
        TelegramService $telegramService,
        RabbitMQClient $rabbitMQClient
    ): void
    {
        try {
            $rabbitMQClient->publishToExchange('plusdate', 'onboarding', $this->userDto->toArray());
        } catch (Exception $exception) {
            Log::info('[ERROR] ValidateUserProfileJob: user '.$this->userDto->id);
            Log::error($exception->getMessage());
            throw $exception;
        }

        $telegramService->sendMessage($this->userDto->id, TelegramMessageEnum::MODERATION_BEGIN_MESSAGE);
    }
}
