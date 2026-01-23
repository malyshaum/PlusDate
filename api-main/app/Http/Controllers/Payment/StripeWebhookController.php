<?php

namespace App\Http\Controllers\Payment;

use App\Enums\Payment\SubscriptionDriverEnum;
use App\Enums\Payment\SubscriptionTypeEnum;
use App\Events\Payment\PremiumGrantedEvent;
use App\Events\Payment\SubscriptionFailedEvent;
use App\Models\Subscription\TelegramSubscription;
use App\Services\Payment\PremiumNotificationServiceInterface;
use App\Services\Subscription\SubscriptionManager;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Laravel\Cashier\Http\Controllers\WebhookController as CashierController;
use Laravel\Cashier\Subscription;
use Symfony\Component\HttpFoundation\Response;

class StripeWebhookController extends CashierController
{
    public function __construct(
        private readonly SubscriptionManager $subscriptionManager,
        private readonly PremiumNotificationServiceInterface $notificationService
    ) {
        parent::__construct();
    }

    protected function handleCustomerSubscriptionCreated(array $payload): Response
    {
        $response = parent::handleCustomerSubscriptionCreated($payload);

        if ($user = $this->getUserByStripeId($payload['data']['object']['customer'])) {
            $this->updateUserPremiumStatus($user);
        }

        return $response;
    }

    protected function handleCustomerSubscriptionUpdated(array $payload): Response
    {
        $data = &$payload['data']['object'];

        if (
            isset($data['cancel_at_period_end']) &&
            $data['cancel_at_period_end'] &&
            !isset($data['current_period_end'])
        ) {
            if (isset($data['cancel_at'])) {
                $data['current_period_end'] = $data['cancel_at'];
            } elseif (isset($data['canceled_at'])) {
                $data['current_period_end'] = $data['canceled_at'];
            }
        }

        $response = parent::handleCustomerSubscriptionUpdated($payload);

        if ($user = $this->getUserByStripeId($payload['data']['object']['customer'])) {
            $this->updateUserPremiumStatus($user);
        }

        return $response;
    }

    protected function handleCustomerSubscriptionDeleted(array $payload): Response
    {
        $response = parent::handleCustomerSubscriptionDeleted($payload);

        if ($user = $this->getUserByStripeId($payload['data']['object']['customer'])) {
            $this->updateUserPremiumStatus($user);
        }

        return $response;
    }

    private function updateUserPremiumStatus($user): void
    {
        $wasPremium = $user->is_premium;

        $stripeSubscription = $this->subscriptionManager->driver(SubscriptionDriverEnum::STRIPE)->current($user);
        $telegramSubscription = $this->subscriptionManager->driver(SubscriptionDriverEnum::TELEGRAM)->current($user);

        $hasPremium = $stripeSubscription !== null || $telegramSubscription !== null;

        if ($wasPremium !== $hasPremium) {
            $user->update(['is_premium' => $hasPremium]);

            if ($hasPremium) {
                try {
                    $this->dispatchPremiumGrantedEvent($user, $stripeSubscription, $telegramSubscription);
                } catch (\Throwable $exception) {
                    Log::error($exception->getMessage());
                }
            } else {
                $this->notificationService->notifyPremiumExpired($user->id);
            }
        }
    }

    private function dispatchPremiumGrantedEvent($user, ?Subscription $stripeSubscription, ?TelegramSubscription $telegramSubscription): void
    {
        $subscriptionType = SubscriptionTypeEnum::MONTH;
        $activeUntil = null;

        if ($stripeSubscription) {
            $subscriptionType = SubscriptionTypeEnum::tryFrom($stripeSubscription->type) ?: $subscriptionType;
            $activeUntil = $stripeSubscription->ends_at ?? $stripeSubscription->trial_ends_at;
        }

//        if ($telegramSubscription) {
//            $subscriptionType = SubscriptionTypeEnum::tryFrom($telegramSubscription->plan);
//            $activeUntil = $telegramSubscription->active_until;
//        }

        $activeUntilCarbon = $activeUntil ? Carbon::parse($activeUntil) : null;

        PremiumGrantedEvent::broadcast(
            $user->id,
            $subscriptionType,
            $activeUntilCarbon
        );

        $this->notificationService->notifyPremiumStarted((int)$user->id);
    }

    protected function handleInvoicePaymentFailed(array $payload): Response
    {
        $invoice = $payload['data']['object'];
        $customerId = $invoice['customer'] ?? null;

        if ($customerId && $user = $this->getUserByStripeId($customerId)) {
            $subscriptionType = null;
            $errorMessage = null;
            $errorCode = null;

            if (isset($invoice['lines']['data'][0]['plan']['id'])) {
                $planId = $invoice['lines']['data'][0]['plan']['id'];
                $subscriptionType = SubscriptionTypeEnum::tryFrom($planId);
            }

            if (isset($invoice['last_finalization_error'])) {
                $errorMessage = $invoice['last_finalization_error']['message'] ?? null;
                $errorCode = $invoice['last_finalization_error']['code'] ?? null;
            }

            try {
                SubscriptionFailedEvent::broadcast(
                    $user->id,
                    'stripe',
                    'invoice_payment_failed',
                    $subscriptionType,
                    $errorMessage,
                    $errorCode
                );
            } catch (\Throwable $exception) {
                Log::error('Failed to broadcast invoice payment failed event', [
                    'user_id' => $user->id,
                    'error' => $exception->getMessage(),
                ]);
            }

            Log::warning('Invoice payment failed', [
                'user_id' => $user->id,
                'customer_id' => $customerId,
                'subscription_type' => $subscriptionType?->value,
                'error_message' => $errorMessage,
                'error_code' => $errorCode,
            ]);
        }

        return new Response('Webhook Handled', 200);
    }

    protected function handlePaymentIntentPaymentFailed(array $payload): Response
    {
        $paymentIntent = $payload['data']['object'];
        $customerId = $paymentIntent['customer'] ?? null;

        if ($customerId && $user = $this->getUserByStripeId($customerId)) {
            $errorMessage = null;
            $errorCode = null;

            if (isset($paymentIntent['last_payment_error'])) {
                $errorMessage = $paymentIntent['last_payment_error']['message'] ?? null;
                $errorCode = $paymentIntent['last_payment_error']['code'] ?? null;
            }

            try {
                SubscriptionFailedEvent::broadcast(
                    $user->id,
                    'stripe',
                    'payment_intent_failed',
                    null,
                    $errorMessage,
                    $errorCode
                );
            } catch (\Throwable $exception) {
                Log::error('Failed to broadcast payment intent failed event', [
                    'user_id' => $user->id,
                    'error' => $exception->getMessage(),
                ]);
            }

            Log::warning('Payment intent failed', [
                'user_id' => $user->id,
                'customer_id' => $customerId,
                'error_message' => $errorMessage,
                'error_code' => $errorCode,
            ]);
        }

        return new Response('Webhook Handled', 200);
    }

    protected function handleChargeFailed(array $payload): Response
    {
        $charge = $payload['data']['object'];
        $customerId = $charge['customer'] ?? null;

        if ($customerId && $user = $this->getUserByStripeId($customerId)) {
            $errorMessage = $charge['failure_message'] ?? null;
            $errorCode = $charge['failure_code'] ?? null;

            try {
                SubscriptionFailedEvent::broadcast(
                    $user->id,
                    'stripe',
                    'charge_failed',
                    null,
                    $errorMessage,
                    $errorCode
                );
            } catch (\Throwable $exception) {
                Log::error('Failed to broadcast charge failed event', [
                    'user_id' => $user->id,
                    'error' => $exception->getMessage(),
                ]);
            }

            Log::warning('Charge failed', [
                'user_id' => $user->id,
                'customer_id' => $customerId,
                'error_message' => $errorMessage,
                'error_code' => $errorCode,
            ]);
        }

        return new Response('Webhook Handled', 200);
    }
}
