<?php

declare(strict_types=1);

namespace App\Services\Telegram\Webhook;

use GuzzleHttp\Psr7\Request as Psr7Request;
use Telegram\Bot\Laravel\Facades\Telegram;

readonly class CommandsHandler
{
    public function handle(array $requestData): void
    {
        Telegram::commandsHandler(true, new Psr7Request(
            'POST',
            '/',
            ['Content-Type' => 'application/json'],
            json_encode($requestData)
        ));
    }
}
