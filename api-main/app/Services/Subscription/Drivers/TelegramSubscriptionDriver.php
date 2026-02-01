<?php

namespace App\Services\Subscription\Drivers;

use App\Enums\Payment\SubscriptionTypeEnum;
use App\Events\Payment\PremiumGrantedEvent;
use App\Models\Subscription\TelegramSubscription;
use App\Models\User;
use App\Services\Payment\PremiumNotificationServiceInterface;
use App\Services\Subscription\Contracts\SubscriptionDriver;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class TelegramSubscriptionDriver implements SubscriptionDriver
{
    public function __construct(
        private readonly PremiumNotificationServiceInterface $notificationService
    ) {
    }

    public function subscribe(User $user, SubscriptionTypeEnum $plan): void
    {
        $untilAt = Carbon::now();

        switch ($plan) {
            case SubscriptionTypeEnum::THREE_DAYS:
                $untilAt->addDays(3);
                break;
            case SubscriptionTypeEnum::MONTH:
                $untilAt->addMonth();
                break;
            case SubscriptionTypeEnum::WEEK:
                $untilAt->addWeek();
                break;
            case SubscriptionTypeEnum::THREE_MONTH:
                $untilAt->addMonths(3);
                break;
        }

        $subscription = TelegramSubscription::query()->updateOrCreate(
            ['user_id' => $user->id, 'plan' => $plan],
            ['active_until' => $untilAt->endOfDay()]
        );

        if (!$user->is_premium) {
            $user->update(['is_premium' => true]);
        }

        PremiumGrantedEvent::broadcast(
            $user->id,
            $plan,
            $subscription->active_until
        );

        $this->notificationService->notifyPremiumStarted($user->id);
    }

    public function cancel(User $user): void
    {
        TelegramSubscription::query()
            ->where('user_id', $user->id)
            ->update(['active_until' => now()]);
    }

    public function isActive(User $user, SubscriptionTypeEnum $plan): bool
    {
        return TelegramSubscription::query()
            ->where('user_id', $user->id)
            ->where('plan', $plan)
            ->where('active_until', '>', now())
            ->exists();
    }

    public function current(User $user): Model|null
    {
        return TelegramSubscription::query()
            ->where('user_id', $user->id)
            ->where('active_until', '>', now())
            ->latest()
            ->first();
    }
}
