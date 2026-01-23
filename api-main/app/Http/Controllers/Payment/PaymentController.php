<?php

namespace App\Http\Controllers\Payment;

use App\Enums\Payment\SubscriptionDriverEnum;
use App\Enums\Payment\SubscriptionTypeEnum;
use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Payment\PremiumNotificationServiceInterface;
use App\Services\Subscription\SubscriptionManager;
use App\Services\TelegramService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use App\Enums\Core\ErrorMessageEnum;

class PaymentController extends Controller
{
    public function __construct(
        private readonly TelegramService $telegramService,
        private readonly SubscriptionManager $subscriptionManager,
        private readonly PremiumNotificationServiceInterface $notificationService,
    ) {
    }

    public function tribute(Request $request): Response|JsonResponse
    {
        $request->validate([
            'range' => [
                'required',
                'string',
                Rule::in(SubscriptionTypeEnum::values()),
                Rule::notIn(['one_day']),
            ]
        ]);

        $links = config('cashier.tribute.links');

        return $this->response([
            'url' => $links[$request->input('range')],
        ]);
    }

    public function currentSubscription(): Response|JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();

        return $this->response([
            SubscriptionDriverEnum::TELEGRAM->value => $this->subscriptionManager->driver(SubscriptionDriverEnum::TELEGRAM)->current($user)?->toArray(),
            SubscriptionDriverEnum::STRIPE->value => $this->subscriptionManager->driver(SubscriptionDriverEnum::STRIPE)->current($user)?->toArray(),
        ]);
    }

    /**
     * @todo Move all business logic inside according service + form request
     * @throws ApiException
     */
    public function subscribe(Request $request): Response|JsonResponse
    {
        $request->validate([
            'range' => [
                'required',
                'string',
                Rule::in(SubscriptionTypeEnum::values()),
                Rule::notIn(['one_day']),
            ]
        ]);

        $range = $request->input('range');
        $redirectUrl = config('cashier.redirect_url').'?startapp=';

        if ($range === 'one_day') {
            throw new ApiException(ErrorMessageEnum::TRIAL_NO_LONGER_AVAILABLE, 400);
        }

        $prices = config('cashier.price_ids');
        $currentPrice = $prices[$range];


        /** @var User $user */
        $user = Auth::user();

        $checkout = $user->newSubscription($range, $currentPrice)
            ->withMetadata([
                'range' => $range,
                'user_id' => $user->id,
            ])
            ->checkout([
                'success_url' => $redirectUrl.'payment_success',
                'cancel_url' => $redirectUrl.'payment_error'
            ]);

        return $this->response([
            'url' => $checkout->url,
        ]);
    }

    public function cancel(): Response|JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $this->subscriptionManager->driver(SubscriptionDriverEnum::STRIPE)->cancel($user);
        $this->subscriptionManager->driver(SubscriptionDriverEnum::TELEGRAM)->cancel($user);

        $user->refresh();
        $stripeSubscription = $this->subscriptionManager->driver(SubscriptionDriverEnum::STRIPE)->current($user);
        $telegramSubscription = $this->subscriptionManager->driver(SubscriptionDriverEnum::TELEGRAM)->current($user);

        if ($stripeSubscription === null && $telegramSubscription === null && $user->is_premium) {
            $user->update(['is_premium' => false]);
            $this->notificationService->notifyPremiumExpired($user->id);
        }

        return $this->response();
    }

    /**
     * @throws ApiException
     */
    public function sendTelegramInvoice(Request $request): Response|JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $request->validate([
            'range' => [
                'required',
                'string',
                Rule::in(SubscriptionTypeEnum::values()),
            ]
        ]);

        return $this->response([
            'url' => $this->telegramService->createInvoiceLink(
                $user->id,
                SubscriptionTypeEnum::from($request->input('range')),
            )
        ]);
    }
}
