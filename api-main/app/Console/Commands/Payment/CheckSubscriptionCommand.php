<?php

declare(strict_types=1);

namespace App\Console\Commands\Payment;

use App\Enums\Payment\PaymentTypeEnum;
use App\Enums\Payment\SubscriptionDriverEnum;
use App\Models\Subscription\TelegramSubscription;
use App\Models\User;
use App\Services\Payment\PremiumNotificationServiceInterface;
use App\Services\Subscription\SubscriptionManager;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class CheckSubscriptionCommand extends Command
{
    protected $signature = 'app:check-subscription';

    protected $description = 'Daily safety check to sync user premium status with active subscriptions';

    private const int CHUNK_SIZE = 100;

    public function handle(
        SubscriptionManager $subscriptionManager,
        PremiumNotificationServiceInterface $notificationService,
    ): void {
        $this->info('starting app:check-subscription command');

        $this->processUsers($subscriptionManager, $notificationService);

        $this->info('finished app:check-subscription command');
    }

    private function processUsers(
        SubscriptionManager $subscriptionManager,
        PremiumNotificationServiceInterface $notificationService,
    ): void {
        User::query()
            ->withTrashed()
            ->where('is_premium', true)
            ->chunk(
                self::CHUNK_SIZE,
                fn(Collection $users) => $this->processUserChunk($users, $subscriptionManager, $notificationService)
            );
    }

    private function processUserChunk(
        Collection $users,
        SubscriptionManager $subscriptionManager,
        PremiumNotificationServiceInterface $notificationService,
    ): void {
        $users->each(
            fn(User $user) => $this->processUser($user, $subscriptionManager, $notificationService)
        );
    }

    private function processUser(
        User $user,
        SubscriptionManager $subscriptionManager,
        PremiumNotificationServiceInterface $notificationService,
    ): void {
        $this->info("processing user {$user->id}");

        $subscriptions = $this->getUserSubscriptions($user, $subscriptionManager);

        if ($this->hasActiveSubscriptions($subscriptions)) {
            $this->info("user {$user->id} still subscribed");
            return;
        }

        $this->handleExpiredSubscription($user, $notificationService);
    }

    private function getUserSubscriptions(User $user, SubscriptionManager $subscriptionManager): array
    {
        return [
            PaymentTypeEnum::STRIPE->value => $subscriptionManager
                ->driver(SubscriptionDriverEnum::STRIPE)
                ->current($user),
            PaymentTypeEnum::TELEGRAM->value => $subscriptionManager
                ->driver(SubscriptionDriverEnum::TELEGRAM)
                ->current($user),
        ];
    }

    /**
     * @param array{stripe: Model|null, telegram: Model|null} $subscriptions
     */
    private function hasActiveSubscriptions(array $subscriptions): bool
    {
        return $subscriptions[PaymentTypeEnum::STRIPE->value] !== null || $subscriptions[PaymentTypeEnum::TELEGRAM->value] !== null;
    }

    private function handleExpiredSubscription(
        User $user,
        PremiumNotificationServiceInterface $notificationService,
    ): void {
        $notificationService->notifyPremiumExpired($user->id);

        $user->update(['is_premium' => false]);
        $this->info("user {$user->id} not subscribed");
    }

}
