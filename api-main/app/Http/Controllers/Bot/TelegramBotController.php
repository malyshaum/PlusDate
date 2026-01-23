<?php

namespace App\Http\Controllers\Bot;

use App\Http\Controllers\Controller;
use App\Http\Requests\Bot\TelegramWebhookRequest;
use App\Services\Telegram\Webhook\WebhookDispatcher;
use App\Services\TelegramService;
use AutoMapperPlus\Exception\UnregisteredMappingException;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

final class TelegramBotController extends Controller
{
    public function __construct(
        private readonly TelegramService $telegramService,
        private readonly WebhookDispatcher $webhookDispatcher,
    ) {
    }

    public function webhook(TelegramWebhookRequest $request): JsonResponse
    {

        Log::debug('[TelegramBotController] webhook', $request->all());

        try {
            $this->webhookDispatcher->dispatch($request->makeCriteria());

            return response()->json(['status' => 'ok']);
        } catch (Exception $e) {
            Log::error('Telegram webhook error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_body' => $request->all()
            ]);

            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * @throws UnregisteredMappingException
     * @throws Exception
     */
    public function moderationWebhook(Request $request): void
    {
        $this->telegramService->processAdminWebhook($request->all());
    }
}
