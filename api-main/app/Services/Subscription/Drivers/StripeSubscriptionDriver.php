<?php

namespace App\Services\Subscription\Drivers;

use App\Enums\Payment\SubscriptionTypeEnum;
use App\Models\User;
use App\Services\Subscription\Contracts\SubscriptionDriver;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Laravel\Cashier\Subscription;

class StripeSubscriptionDriver implements SubscriptionDriver
{
    /**
     * @throws Exception
     */
    public function subscribe(User $user, SubscriptionTypeEnum $plan): void
    {
        throw new Exception('cant be used');
    }

    public function cancel(User $user): void
    {
        foreach (SubscriptionTypeEnum::values() as $type) {
            $subscription = $user->subscription($type);

            if ($subscription !== null && $subscription->active()) {
                $subscription->cancel();
            }
        }

    }

    public function isActive(User $user, SubscriptionTypeEnum $plan): bool
    {
        return $user->subscribed($plan->value);
    }

    public function current(User $user): Model|null
    {
        /** @var  $subscription Subscription */
        foreach ($user->subscriptions()->get() as $subscription) {
            if ($subscription->valid()) {
                return $subscription;
            }
        }

        return null;
    }
}
