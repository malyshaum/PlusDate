<?php

namespace App\Listeners\Stripe;

use App\Enums\Payment\PaymentStatusEnum;
use App\Enums\Payment\PaymentTypeEnum;
use App\Models\Subscription\Transaction;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Laravel\Cashier\Events\WebhookHandled;
use Laravel\Cashier\Events\WebhookReceived;
use Laravel\Cashier\Cashier;

/**
 * Automatically loaded by a framework
 */
class PaymentListener implements ShouldQueue
{

    public function handle(WebhookHandled|WebhookReceived $event): void
    {
        Log::info('[PaymentListener] event', $event->payload);

        $payload = $event->payload;
        $eventType = $payload['type'] ?? null;

        match ($eventType) {
            'customer.subscription.created' => $this->handleSubscriptionCreated($payload),
            'customer.subscription.updated' => $this->handleSubscriptionUpdated($payload),
            'invoice.paid' => $this->handleInvoicePaid($payload),
            'charge.succeeded' => $this->handleChargeSucceeded($payload),
            default => null,
        };
    }

    private function handleSubscriptionCreated(array $payload): void
    {
        $customerId = $payload['data']['object']['customer'] ?? null;
        $status = $payload['data']['object']['status'] ?? null;

        if (!$customerId || !$status) {
            return;
        }

        if (!in_array($status, ['active', 'trialing'])) {
            Log::info('[PaymentListener] Subscription created with non-active status, skipping premium grant', [
                'stripe_id' => $customerId,
                'status' => $status,
            ]);
            return;
        }

        $user = Cashier::findBillable($customerId);
        if ($user && !$user->is_premium) {
            $user->update(['is_premium' => true]);

            Log::info('[PaymentListener] User marked as premium (subscription created)', [
                'user_id' => $user->id,
                'stripe_id' => $customerId,
                'status' => $status,
            ]);
        }
    }

    private function handleSubscriptionUpdated(array $payload): void
    {
        $customerId = $payload['data']['object']['customer'] ?? null;
        $status = $payload['data']['object']['status'] ?? null;

        if (!$customerId || !$status) {
            return;
        }

        if (in_array($status, ['active', 'trialing'])) {
            $user = Cashier::findBillable($customerId);
            if ($user && !$user->is_premium) {
                $user->update(['is_premium' => true]);

                Log::info('[PaymentListener] User marked as premium (subscription updated)', [
                    'user_id' => $user->id,
                    'stripe_id' => $customerId,
                    'status' => $status,
                ]);
            }
        }
    }

    private function handleInvoicePaid(array $payload): void
    {
        $customerId = $payload['data']['object']['customer'] ?? null;
        if (!$customerId) {
            return;
        }

        $user = Cashier::findBillable($customerId);
        if ($user && !$user->is_premium) {
            $user->update(['is_premium' => true]);

            Log::info('[PaymentListener] User marked as premium (invoice paid)', [
                'user_id' => $user->id,
                'stripe_id' => $customerId,
            ]);
        }
    }

    private function handleChargeSucceeded(array $payload): void
    {
        $customerId = $payload['data']['object']['customer'] ?? null;
        if (!$customerId) {
            return;
        }

        $user = Cashier::findBillable($customerId);
        if ($user && !$user->is_premium) {
            $user->update(['is_premium' => true]);
            Transaction::query()->create([
                'user_id' => $user->id,
                'external_id' => $payload['data']['id'],
                'amount' => $payload['data']['amount'],
                'currency' => $payload['data']['currency'],
                'type' => PaymentTypeEnum::STRIPE,
                'metadata' => $payload['data']['metadata'],
                'status' => PaymentStatusEnum::SUCCESS,
            ]);

            Log::info('[PaymentListener] User marked as premium (charge succeeded)', [
                'user_id' => $user->id,
                'stripe_id' => $customerId,
            ]);
        }
    }
}
