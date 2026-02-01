<?php

declare(strict_types=1);

namespace App\Services\Telegram\Webhook;

use App\Enums\Payment\PaymentStatusEnum;
use App\Enums\Payment\PaymentTypeEnum;
use App\Enums\Payment\SubscriptionDriverEnum;
use App\Enums\Payment\SubscriptionTypeEnum;
use App\Models\Subscription\Transaction;
use App\Models\User;
use App\Services\Subscription\SubscriptionManager;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

readonly class SuccessfulPaymentHandler
{
    public function __construct(
        private SubscriptionManager $subscriptionManager,
    )
    {
    }

    public function handle(array $message): void
    {
        $payment = $message['successful_payment'];
        $payload = json_decode($payment['invoice_payload'], true, 512, JSON_THROW_ON_ERROR);

        $userId = $payload['user_id'];
        $subscriptionType = SubscriptionTypeEnum::from($payload['range']);

        $user = User::query()->findOrFail($userId);

        DB::beginTransaction();
        try {
            $this->subscriptionManager
                ->driver(SubscriptionDriverEnum::TELEGRAM)
                ->subscribe($user, $subscriptionType);

            Transaction::query()->create([
                'user_id' => $userId,
                'external_id' => $payment['telegram_payment_charge_id'],
                'amount' => $payment['total_amount'],
                'currency' => $payment['currency'],
                'type' => PaymentTypeEnum::TELEGRAM,
                'metadata' => $message,
                'status' => PaymentStatusEnum::SUCCESS,
            ]);

            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to process successful payment', [
                'error' => $e->getMessage(),
                'payment' => $message['successful_payment'] ?? null
            ]);
        }
    }
}
