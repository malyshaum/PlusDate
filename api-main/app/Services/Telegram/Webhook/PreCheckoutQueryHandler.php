<?php

declare(strict_types=1);

namespace App\Services\Telegram\Webhook;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

readonly class PreCheckoutQueryHandler
{
    public function handle(array $preCheckoutQuery): void
    {
        $botToken = config('services.telegram.client_secret');
        $queryId = $preCheckoutQuery['id'];

        try {
            Http::post("https://api.telegram.org/bot{$botToken}/answerPreCheckoutQuery", [
                'pre_checkout_query_id' => $queryId,
                'ok' => true,
            ]);
        } catch (Exception $e) {
            Http::post("https://api.telegram.org/bot{$botToken}/answerPreCheckoutQuery", [
                'pre_checkout_query_id' => $queryId,
                'ok' => false,
                'error_message' => 'Payment processing error. Please try again.'
            ]);

            Log::error('Pre-checkout query failed', [
                'query_id' => $queryId,
                'error' => $e->getMessage()
            ]);
        }
    }
}
