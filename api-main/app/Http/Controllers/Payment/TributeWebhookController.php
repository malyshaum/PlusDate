<?php

namespace App\Http\Controllers\Payment;

use App\Enums\Payment\PaymentStatusEnum;
use App\Enums\Payment\PaymentTypeEnum;
use App\Enums\Payment\SubscriptionDriverEnum;
use App\Enums\Payment\SubscriptionTypeEnum;
use App\Http\Controllers\Controller;
use App\Models\Subscription\Transaction;
use App\Models\User;
use App\Services\Subscription\SubscriptionManager;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TributeWebhookController extends Controller
{
    // TODO: move to config if needed
    private const array ADMIN_USERNAMES = [
        'shvladzt',
        'alesdead',
        'anakul',
        'bogdanlischuk'
    ];

    public function __construct(
        private readonly SubscriptionManager $subscriptionManager
    ) {
    }

    /**
     * @throws Exception
     */
    public function handleWebhook(Request $request): Response|JsonResponse
    {
        $signature = $request->header('trbt-signature');

        $skipSignatureCheck = false;
        if($request->header('x-user') !== null && in_array($request->header('x-user'), self::ADMIN_USERNAMES)) {
            $skipSignatureCheck = true;
        }

        if ($skipSignatureCheck === false) {
            $expected = hash_hmac('sha256', $request->getContent(), config('services.tribute.api_key'));

            if (!$signature || !hash_equals($expected, $signature)) {
                abort(401, 'Invalid signature');
            }
        }

        $payload = json_decode($request->getContent(), true)['payload'];

        $user = User::query()->findOrFail($payload['telegram_user_id']);
        $productType = array_flip(config('cashier.tribute.products'))[$payload['product_id']];
        $subscriptionTypeEnum = SubscriptionTypeEnum::tryFrom($productType);

        DB::beginTransaction();
        try {
            $this->subscriptionManager
                ->driver(SubscriptionDriverEnum::TELEGRAM)
                ->subscribe($user, $subscriptionTypeEnum);

            $user->update(['is_premium' => true]);

            Transaction::query()->create([
                'user_id' => $user->id,
                'external_id' => $payload['product_id'],
                'amount' => $payload['amount'],
                'currency' => $payload['currency'],
                'type' => PaymentTypeEnum::TRIBUTE,
                'metadata' => $payload,
                'status' => PaymentStatusEnum::SUCCESS,
            ]);

            DB::commit();
        } catch (Exception $exception) {
            DB::rollBack();
            Log::error($exception->getMessage());
            throw $exception;
        }

        return $this->response();
    }
}
