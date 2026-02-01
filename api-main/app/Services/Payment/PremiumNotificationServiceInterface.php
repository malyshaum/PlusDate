<?php

declare(strict_types=1);

namespace App\Services\Payment;

use AutoMapperPlus\Exception\UnregisteredMappingException;

interface PremiumNotificationServiceInterface
{
    /**
     * @throws UnregisteredMappingException
     */
    public function notifyPremiumStarted(int $userId): void;

    /**
     * @throws UnregisteredMappingException
     */
    public function notifyPremiumExpired(int $userId, ?bool $withDeleted = false): void;
}
