<?php

declare(strict_types=1);

namespace App\Services\Admin;

use App\Services\Payment\PremiumNotificationServiceInterface;
use Throwable;
use App\Enums\Payment\SubscriptionDriverEnum;
use App\Enums\Payment\SubscriptionTypeEnum;
use App\Repositories\UserRepository;
use App\Services\Subscription\SubscriptionManager;

readonly final class PremiumManagementService implements PremiumManagementServiceInterface
{
    public function __construct(
        private SubscriptionManager $subscriptionManager,
        private UserRepository $userRepository,
        private PremiumNotificationServiceInterface $notificationService
    ) {
    }

    /**
     * @throws Throwable
     */
    public function grantPremium(int $userId, SubscriptionTypeEnum $period): void
    {
        $user = $this->userRepository->find($userId);

        $this->subscriptionManager->driver(SubscriptionDriverEnum::TELEGRAM)->subscribe(
            user: $user,
            plan: $period,
        );
    }

    /**
     * @throws Throwable
     */
    public function revokePremium(int $userId): void
    {
        $user = $this->userRepository->find($userId);

        $this->subscriptionManager->driver(SubscriptionDriverEnum::TELEGRAM)->cancel(user: $user);

        $this->notificationService->notifyPremiumExpired($user->id);
    }
}
