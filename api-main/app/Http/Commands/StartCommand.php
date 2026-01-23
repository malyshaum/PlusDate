<?php

namespace App\Http\Commands;

use App\Dto\User\UpsertUserDto;
use App\Enums\Telegram\TelegramMessageEnum;
use App\Services\User\UserService;
use App\Services\User\NameNormalizationServiceInterface;
use Exception;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Log;
use Telegram\Bot\Commands\Command;
use Telegram\Bot\Exceptions\TelegramResponseException;
use Telegram\Bot\FileUpload\InputFile;
use Telegram\Bot\Keyboard\Keyboard;

class StartCommand extends Command
{
    protected string $name = 'start';
    protected string $pattern = '{startParam}';
    protected string $description = 'Start bot';

    public function __construct(
        private readonly UserService $userService,
        private readonly NameNormalizationServiceInterface $nameNormalizationService,
    ) {
    }

    public function handle(): void
    {
        $userId = $this->getUpdate()->getChat()->getId();
        $startParam = $this->argument('startParam');

        $userData = $this->update->message->from;

        Log::debug('[StartCommand]', $userData->toArray());

        $userExists = DB::table('users')
            ->where('id', (int)$userId)
            ->exists();

        if ($userExists === false) {
            $rawUserData = $userData->getRawResponse();

            Log::info('raw user: ', $rawUserData);

            $fullName = sprintf(
                '%s %s',
                $this->nameNormalizationService->normalize($userData->firstName),
                $this->nameNormalizationService->normalize($userData->lastName)
            );

            $upsertDto = new UpsertUserDto();
            $upsertDto->id = $userData->id;
            $upsertDto->username = $userData->username;
            $upsertDto->languageCode = $userData->languageCode;
            $upsertDto->name = $fullName;
            $upsertDto->isOnboarded = false;
            $upsertDto->startParam = $startParam;
            $upsertDto->isUnderModeration = false;
            $upsertDto->isTrialUsed = false;
            $upsertDto->telegramPremium = $rawUserData['is_premium'] ?? false;
            $upsertDto->botBlocked = false;
            $upsertDto->botBlockedAt = null;

            $this->userService->upsert($upsertDto);
        }

        try {
            $lastLog = DB::table('start_log')
                ->where('telegram_id', $userId)
                ->where('start_param', $startParam)
                ->latest()
                ->first();


            if ($lastLog === null) {
                DB::table('start_log')->insert([
                    'telegram_id' => $userId,
                    'start_param' => $startParam,
                    'created_at' => now(),
                ]);

                DB::table('reflinks')
                    ->where('source', $startParam)
                    ->incrementEach([
                        'all' => 1,
                        'unique' => 1,
                    ]);
            } else {
                if (Carbon::parse($lastLog->created_at)->lt(Carbon::now()->subHour())) {
                    DB::table('reflinks')
                        ->where('source', $startParam)
                        ->incrementEach([
                            'all' => 1,
                        ]);
                }
            }
        } catch (Exception $exception ) {
            Log::error($exception->getMessage());
        }

        try {
            $video = 'video.mp4';
            $video = public_path($video);

            $keyboard = Keyboard::make()
                ->inline()
                ->row([
                    Keyboard::inlineButton([
                        'text' => Lang::get(TelegramMessageEnum::OPEN_APP_BUTTON_TEXT->value, locale: $userData->languageCode),
                        'web_app' => ['url' => config('services.telegram.mini_app_url')],
                    ])
                ]);

            $this->replyWithAnimation([
                'chat_id' => $userId,
                'caption' => Lang::get('start_message', locale: $userData->languageCode),
                'animation' => InputFile::create($video),
                'parse_mode' => 'HTML',
                'reply_markup' => $keyboard,
            ]);
        } catch (TelegramResponseException $exception) {
            Log::error('START EXCEPTION: '.$exception->getMessage());
        }
    }
}
