<?php

declare(strict_types=1);

namespace App\Services\Payment;

use App\Dto\User\UserDto;
use App\Jobs\Telegram\SendBotMessageJob;
use App\Enums\Telegram\TelegramMessageEnum;
use App\Repositories\UserRepository;
use AutoMapperPlus\Exception\UnregisteredMappingException;
use Illuminate\Support\Facades\Log;

readonly class PremiumNotificationService implements PremiumNotificationServiceInterface
{
    public function __construct(
        private UserRepository $userRepository,
    ) {
    }

    /**
     * @throws UnregisteredMappingException
     */
    public function notifyPremiumStarted(int $userId): void
    {
        try {
            $userDto = $this->getUserDto($userId);
            if ($userDto === null) {
                return;
            }

            $this->dispatchNotification($userDto, TelegramMessageEnum::PREMIUM_STARTED_MESSAGE);
        } catch (\Exception $e) {
            Log::error("Failed to send premium started notification", [
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * @throws UnregisteredMappingException
     */
    public function notifyPremiumExpired(int $userId, ?bool $withDeleted = false): void
    {
        try {
            $userDto = $this->getUserDto($userId, $withDeleted);
            if ($userDto === null) {
                return;
            }

            $this->dispatchNotification($userDto, TelegramMessageEnum::PREMIUM_EXPIRED_MESSAGE);
        } catch (\Exception $e) {
            Log::error("Failed to send premium expired notification", [
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * @throws UnregisteredMappingException
     */
    private function getUserDto(int $userId, ?bool $withDeleted = false): UserDto|null
    {
        return $this->userRepository->getById($userId, $withDeleted);
    }

    private function dispatchNotification(UserDto $userDto, TelegramMessageEnum $messageEnum): void
    {
        SendBotMessageJob::dispatch($userDto, $messageEnum);
    }
}
