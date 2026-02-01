<?php

namespace App\Services\Telegram;

use App\Dto\Chat\CreateChatDto;
use App\Enums\Telegram\NotificationNavigationEnum;
use App\Services\Chat\ChatService;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Log;

readonly class TelegramNavigationService
{
    public function __construct(
        private ChatService $chatService,
    ) {
    }

    /**
     * @throws Exception
     */
    public function handleNavigation(array $data, int $userId): void
    {
        $nav = $data['nav'] ?? null;

        if ($nav === null) {
            return;
        }

        try {
            match ($nav) {
                NotificationNavigationEnum::MATCH->value => $this->handleMatchNavigation(
                    $userId,
                    isset($data['chat_id']) ? (int) $data['chat_id'] : null,
                    isset($data['user_id']) ? (int) $data['user_id'] : null
                ),
                default => Log::warning('Unknown navigation type', ['nav' => $nav, 'user_id' => $userId]),
            };
        } catch (Exception $exception) {
            Log::error('Failed to handle navigation', [
                'nav' => $nav,
                'user_id' => $userId,
                'error' => $exception->getMessage(),
            ]);
            throw $exception;
        }
    }

    /**
     * @throws Exception
     */
    private function handleMatchNavigation(int $userId, ?int $chatId, ?int $otherUserId): void
    {
        DB::beginTransaction();
        try {
            $finalChatId = $chatId;

            if ($finalChatId === null && $otherUserId !== null) {
                $createDto = new CreateChatDto();
                $createDto->userId = $userId;
                $createDto->otherUserId = $otherUserId;
                $chatDto = $this->chatService->createChat($createDto);
                $finalChatId = $chatDto->id;
            }

            if ($finalChatId !== null) {
                $this->chatService->createServiceMessage($finalChatId, $userId);
            }

            DB::commit();
        } catch (Exception $exception) {
            DB::rollBack();
            throw $exception;
        }
    }
}
