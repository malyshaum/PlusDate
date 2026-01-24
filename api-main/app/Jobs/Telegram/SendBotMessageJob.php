<?php

namespace App\Jobs\Telegram;

use App\Dto\User\UserDto;
use App\Enums\Telegram\TelegramMessageEnum;
use App\Services\TelegramService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendBotMessageJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        private readonly UserDto $userDto,
        private readonly TelegramMessageEnum $messageEnum,
    )
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(TelegramService $telegramService): void
    {
        $telegramService->sendMessage($this->userDto->id, $this->messageEnum);
    }
}
