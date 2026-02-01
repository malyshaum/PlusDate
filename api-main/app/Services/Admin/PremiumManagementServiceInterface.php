<?php

declare(strict_types=1);

namespace App\Services\Admin;

use App\Enums\Payment\SubscriptionTypeEnum;

interface PremiumManagementServiceInterface
{
    public function grantPremium(int $userId, SubscriptionTypeEnum $period): void;

    public function revokePremium(int $userId): void;
}
