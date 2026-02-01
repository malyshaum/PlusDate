<?php

namespace App\Services\User;

use App\Enums\Payment\SubscriptionTypeEnum;
use App\Events\Payment\PremiumGrantedEvent;
use App\Models\Subscription\TelegramSubscription;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

readonly class PremiumGrantService
{
    public function grantInitialPremiumToWoman(int $userId): void
    {
        DB::transaction(function () use ($userId) {
            $user = User::query()->findOrFail($userId);

            if ($user->initial_premium_granted_at !== null) {
                return;
            }

            $activeUntil = Carbon::now()->addDays(30)->endOfDay();

            $subscription = TelegramSubscription::query()->create([
                'user_id' => $user->id,
                'plan' => SubscriptionTypeEnum::MONTH->value,
                'active_until' => $activeUntil,
            ]);

            $user->update([
                'is_premium' => true,
                'initial_premium_granted_at' => Carbon::now(),
            ]);

            PremiumGrantedEvent::broadcast(
                $user->id,
                SubscriptionTypeEnum::MONTH,
                $subscription->active_until
            );
        });
    }

    public function shouldGrantInitialPremium(int $userId): bool
    {
        $user = User::query()->findOrFail($userId);

        if ($user->initial_premium_granted_at !== null) {
            return false;
        }

        if ($user->is_premium) {
            return false;
        }

        return true;
    }
}
