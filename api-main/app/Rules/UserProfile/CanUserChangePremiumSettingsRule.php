<?php

namespace App\Rules\UserProfile;

use App\Enums\Core\ErrorMessageEnum;
use App\Enums\Payment\SubscriptionDriverEnum;
use App\Enums\Payment\SubscriptionTypeEnum;
use App\Models\User;
use App\Rules\BaseRule;
use App\Services\Subscription\SubscriptionManager;
use Illuminate\Support\Facades\Auth;

class CanUserChangePremiumSettingsRule extends BaseRule
{
    public function __construct(
        private readonly SubscriptionManager $subscriptionManager,
    )
    {

    }

    protected string $message = ErrorMessageEnum::VALIDATION_NO_ACTIVE_SUBSCRIPTION->value;

    public function passes($attribute, $value): bool
    {
        if (filter_var($value, FILTER_VALIDATE_BOOLEAN) === false) {
            return true;
        }

        /** @var User $user */
        $user = Auth::user();

        if (
            $this->subscriptionManager->driver(SubscriptionDriverEnum::TELEGRAM)->current($user)
            || $this->subscriptionManager->driver(SubscriptionDriverEnum::STRIPE)->current($user)
        ) {
            return true;
        }

        return false;
    }
}
