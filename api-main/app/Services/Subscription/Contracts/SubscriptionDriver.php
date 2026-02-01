<?php

namespace App\Services\Subscription\Contracts;

use App\Enums\Payment\SubscriptionTypeEnum;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

interface SubscriptionDriver
{
    public function subscribe(User $user, SubscriptionTypeEnum $plan): void;
    public function cancel(User $user): void;
    public function isActive(User $user, SubscriptionTypeEnum $plan): bool;
    public function current(User $user): Model|null;
}
