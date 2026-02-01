<?php

declare(strict_types=1);

namespace App\Services\Telegram\Webhook;

use App\Services\Telegram\TelegramNavigationService;
use Illuminate\Support\Facades\Log;

readonly class WebAppDataHandler
{
    public function __construct(
        private TelegramNavigationService $navigationService,
    )
    {
    }

    public function handle(array $message): void
    {
        $webAppData = $message['web_app_data'] ?? null;
        $from = $message['from'] ?? null;

        if (!$webAppData || !$from) {
            return;
        }

        $userId = (int)($from['id'] ?? null);
        if (!$userId) {
            return;
        }

        $dataString = $webAppData['data'] ?? '';
        parse_str($dataString, $data);

        $this->navigationService->handleNavigation($data, $userId);
    }
}
