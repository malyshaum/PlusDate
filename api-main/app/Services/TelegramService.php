<?php

namespace App\Services;

use App\Dto\Telegram\MatchNotificationDataDto;
use App\Dto\User\UserDto;
use App\Enums\Core\ErrorMessageEnum;
use App\Enums\Core\FileTypeEnum;
use App\Enums\Core\GenderEnum;
use App\Enums\Moderation\RejectionReasonEnum;
use App\Enums\Payment\SubscriptionTypeEnum;
use App\Enums\Telegram\BotNotificationTypeEnum;
use App\Enums\Telegram\TelegramMessageEnum;
use App\Enums\User\DeletionReasonEnum;
use App\Events\Moderation\ModerationStatusUpdatedEvent;
use App\Exceptions\ApiException;
use App\Jobs\Telegram\SendBotMessageJob;
use App\Models\Dictionary\Activity;
use App\Models\Dictionary\City;
use App\Models\Moderation\UserModeration;
use App\Models\User;
use App\Models\User\UserFile;
use App\Repositories\UserRepository;
use AutoMapperPlus\Exception\UnregisteredMappingException;
use Exception;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use OpenSwoole\Coroutine;
use Telegram\Bot\Exceptions\TelegramResponseException;
use Telegram\Bot\FileUpload\InputFile;
use Telegram\Bot\Keyboard\Keyboard;
use Telegram\Bot\Laravel\Facades\Telegram;

readonly class TelegramService
{
    private const int DELETION_REPORTS_THREAD_ID = 301;

    private const string NOTIFICATION_URL_LIKES = '/likes';
    private const string NOTIFICATION_URL_MESSAGES = '/chats';
    private const string NOTIFICATION_URL_MATCHES = '/chats';

    public function __construct(
        private UserRepository $userRepository,
    )
    {

    }

    public function sendNotificationMessage(
        int $chatId,
        string $message,
        string $imagePath,
        BotNotificationTypeEnum $notificationType,
        ?MatchNotificationDataDto $matchData = null
    ): void {
        $url = $this->buildNotificationUrl($notificationType, $matchData);

        $keyboard = Keyboard::make()
            ->inline()
            ->row([
                Keyboard::inlineButton([
                    'text' => Lang::get(TelegramMessageEnum::OPEN_APP_BUTTON_TEXT->value),
                    'web_app' => ['url' => $url],
                ])
            ]);

        $params = [
            'chat_id' => $chatId,
            'caption' => $message,
            'parse_mode' => 'HTML',
            'photo' => InputFile::create($imagePath),
            'reply_markup' => $keyboard
        ];

        Coroutine::create(function () use ($params) {
            try {
                Telegram::sendPhoto($params);
            } catch (TelegramResponseException $e) {
                Log::warning('Failed to send Telegram photo notification', [
                    'chat_id' => $params['chat_id'],
                    'error' => $e->getMessage(),
                ]);
            }
        });
    }

    private function buildNotificationUrl(
        BotNotificationTypeEnum $notificationType,
        ?MatchNotificationDataDto $matchData = null
    ): string {
        $baseUrl = rtrim(config('services.telegram.mini_app_url'), '/');

        $urlTemplate = match ($notificationType) {
            BotNotificationTypeEnum::LIKES => self::NOTIFICATION_URL_LIKES,
            BotNotificationTypeEnum::MESSAGES => self::NOTIFICATION_URL_MESSAGES,
            BotNotificationTypeEnum::MATCHES => self::NOTIFICATION_URL_MATCHES,
        };

        if ($notificationType === BotNotificationTypeEnum::MATCHES && $matchData !== null) {
            $chatId = $matchData->chatId ?? null;
            $userId = $matchData->otherUserId ?? null;

            if ($chatId === null || $userId === null) {
                Log::warning('Match notification missing required parameters', [
                    'chat_id' => $chatId,
                    'user_id' => $userId,
                ]);
                $url = self::NOTIFICATION_URL_MESSAGES;
            } else {
                $url = str_replace(['{chatId}', '{userId}'], [(string)$chatId, (string)$userId], $urlTemplate);
            }
        } else {
            $url = $urlTemplate;
        }

        return $baseUrl . $url;
    }

    public function sendMessage(int $chatId, TelegramMessageEnum|string $message): void
    {
        if ($message instanceof TelegramMessageEnum) {
            $userLang = User::query()->find($chatId);
            $message = Lang::get($message->value, locale: $userLang?->language_code);
        }

        $keyboard = Keyboard::make()
            ->inline()
            ->row([
                Keyboard::inlineButton([
                    'text' => Lang::get(TelegramMessageEnum::OPEN_APP_BUTTON_TEXT->value),
                    'web_app' => ['url' => config('services.telegram.mini_app_url')],
                ])
            ]);

        $params = [
            'chat_id' => $chatId,
            'text' => $message,
            'parse_mode' => 'HTML',
            'reply_markup' => $keyboard
        ];

        Coroutine::create(function () use ($params) {
            try {
                Telegram::sendMessage($params);
            } catch (TelegramResponseException $e) {
                Log::warning('Failed to send Telegram message', [
                    'chat_id' => $params['chat_id'],
                    'error' => $e->getMessage(),
                ]);
            }
        });
    }

    /**
     * @param array $data
     * @param null $authDateDiff
     * @return bool
     */
    public function validateWebAppData(array $data, $authDateDiff = null): bool
    {
        $sign = $data['hash'];
        unset($data['hash']);

        ksort($data);
        $checkString = '';
        foreach ($data as $k => $v) {
            $checkString .= "$k=$v\n";
        }
        $checkString = trim($checkString);

        $secret = hash_hmac('sha256', config('services.telegram.client_secret'), 'WebAppData', true);
        $check = bin2hex(hash_hmac('sha256', $checkString, $secret, true)) === $sign;
        if ($check) {
            return true;
        }

        $tokens = config('services.telegram.bot_tokens');

        foreach ($tokens as $token) {
            $secret = hash_hmac('sha256', $token, 'WebAppData', true);
            $check = bin2hex(hash_hmac('sha256', $checkString, $secret, true)) === $sign;

            if ($check) {
                return true;
            }
        }

        return false;
    }

    /**
     * @throws ApiException
     */
    public function createInvoiceLink(int $userId, SubscriptionTypeEnum $subscriptionType): string
    {
        $botToken = config('services.telegram.client_secret');

        try {
            $response = Http::post("https://api.telegram.org/bot{$botToken}/createInvoiceLink", [
                'title' => 'Subscription: '.$subscriptionType->value,
                'description' => 'Description of item',
                'payload' => json_encode(['range' => $subscriptionType->value, 'user_id' => $userId]),
                'provider_token' => '',
                'currency' => 'XTR',
                'prices' => json_encode([
                    [
                        'label' => $subscriptionType->value,
                        'amount' => $this->getStarsAmount($subscriptionType)
                    ]
                ])
            ]);
        } catch (Exception $exception) {
            Log::error($exception->getMessage());
            throw new ApiException(ErrorMessageEnum::API_TELEGRAM_CREATE_INVOICE_ERROR);
        }

        return $response->json('result');
    }

    private function getStarsAmount(SubscriptionTypeEnum $type): int
    {
        $prices = config('cashier.prices_stars');

        return match($type) {
            SubscriptionTypeEnum::WEEK => $prices[SubscriptionTypeEnum::WEEK->value],
            SubscriptionTypeEnum::MONTH => $prices[SubscriptionTypeEnum::MONTH->value],
            SubscriptionTypeEnum::THREE_MONTH => $prices[SubscriptionTypeEnum::THREE_MONTH->value],
            SubscriptionTypeEnum::THREE_DAYS => $prices[SubscriptionTypeEnum::THREE_DAYS->value],
        };
    }

    /**
     * @throws UnregisteredMappingException
     * @throws ApiException
     */
    public function processAdminWebhook(array $update): void
    {
        DB::beginTransaction();
        try {
            if (isset($update['callback_query'])) {
                $callbackData = json_decode($update['callback_query']['data'], true);
                $action = $callbackData['action'];

                // TODO: replace with enum
                $result = $action === 'accept';

                $botToken = config('telegram.moderation_bot.token');
                $messageId = $update['callback_query']['message']['message_id'];
                $chatId = $update['callback_query']['message']['chat']['id'];
                $admin = $update['callback_query']['from'];

                $userDto = $this->userRepository->getById($callbackData['user_id']);
                if ($userDto === null) {
                    throw new ApiException(ErrorMessageEnum::ENTITY_DOESNT_EXISTS_ERROR);
                }

                $reasonEnum = null;
                if ($result === false) {
                    $reasonEnum = RejectionReasonEnum::from($callbackData['rejection_reason']);
                    $status = $reasonEnum->name;
                } else {
                    $status = 'ACCEPTED';
                }

                $originalText = $update['callback_query']['message']['text'] ?? '';
                $statusText = "\n\n[{$admin['id']}] {$admin['first_name']} changed status to: {$status}";
                $newText = $originalText . $statusText;

                Http::post("https://api.telegram.org/bot{$botToken}/editMessageText", [
                    'chat_id' => $chatId,
                    'message_id' => $messageId,
                    'text' => $newText,
                    'reply_markup' => json_encode(['inline_keyboard' => []])
                ]);

                if ($result === true) {
                    UserModeration::query()
                        ->where('user_id', $userDto->id)
                        ->where('rejection_reason', RejectionReasonEnum::DECLINED_BY_ADMIN)
                        ->where('is_resolved', false)
                        ->update(['is_resolved' => true]);

                    User::query()
                        ->find($callbackData['user_id'])
                        ->update(['is_under_moderation' => false]);

                    UserFile::query()
                        ->where('user_id', $userDto->id)
                        ->where('is_under_moderation', true)
                        ->update(['is_under_moderation' => false]);

                    ModerationStatusUpdatedEvent::broadcast($userDto, null);
                    SendBotMessageJob::dispatch($userDto, TelegramMessageEnum::MODERATION_SUCCESS_MESSAGE);
                } else {
                    $note = Lang::get(strtolower($reasonEnum->name), locale: $userDto->languageCode);

                    UserModeration::query()->create([
                        'user_id' => $userDto->id,
                        'rejection_reason' => RejectionReasonEnum::DECLINED_BY_ADMIN,
                        'is_resolved' => false,
                        'note' => $note,
                    ]);

                    ModerationStatusUpdatedEvent::broadcast($userDto, RejectionReasonEnum::DECLINED_BY_ADMIN);
                    SendBotMessageJob::dispatch($userDto, TelegramMessageEnum::MODERATION_FAILED_MESSAGE);
                }
            }
            DB::commit();
        } catch (Exception $exception) {
            DB::rollBack();
            Log::error($exception->getMessage());
            throw $exception;
        }
    }

    /**
     * @throws Exception
     * @param DeletionReasonEnum[] $reasons
     */
    public function sendDeletionReport(UserDto $userDto, array $reasons, ?string $note): void
    {
        $botToken = config('telegram.moderation_bot.token');
        $chatId = config('telegram.moderation_bot.chat_id');
        $threadId = self::DELETION_REPORTS_THREAD_ID;

        try {
            $text = "🗑️ <b>Account Deletion Report</b>\n\n";
            $text .= "ID: {$userDto->id}\n";
            $text .= "Name: {$userDto->name}\n";
            $text .= "Username: @{$userDto->username}\n";
            $text .= "Gender: {$userDto->feedProfile?->sex?->value}\n";
            $text .= "Age: {$userDto->feedProfile?->age}\n";
            $text .= "Premium: " . ($userDto->isPremium ? 'Yes' : 'No') . "\n";
            $text .= "Language: {$userDto->languageCode}\n\n";
            $text .= "Reasons:\n";
            foreach ($reasons as $reason) {
                $text .= "  • {$reason->value}\n";
            }
            if ($note) {
                $text .= "\nNote: {$note}\n";
            }
            $text .= "\nDeleted at: " . now()->format('Y-m-d H:i:s');

            $payload = [
                'chat_id' => $chatId,
                'text' => $text,
                'parse_mode' => 'HTML',
            ];

            if (config('app.env') === 'production') {
                $payload['message_thread_id'] = $threadId;
            }

            Http::post("https://api.telegram.org/bot{$botToken}/sendMessage", $payload);

        } catch (Exception $exception) {
            Log::error('Failed to send deletion report to Telegram', [
                'user_id' => $userDto->id,
                'error' => $exception->getMessage()
            ]);
        }
    }
}
