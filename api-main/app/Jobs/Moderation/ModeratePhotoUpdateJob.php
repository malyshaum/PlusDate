<?php

namespace App\Jobs\Moderation;

use App\Dto\User\UserDto;
use App\Enums\Moderation\RejectionReasonEnum;
use App\Enums\Telegram\TelegramMessageEnum;
use App\Events\Moderation\PhotoModerationResultEvent;
use App\Models\User\UserFile;
use App\Services\Moderation\ModerationService;
use App\Services\TelegramService;
use App\Services\User\UserService;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ModeratePhotoUpdateJob implements ShouldQueue
{
    use Queueable;

    private readonly ModerationService $moderationService;
    private readonly TelegramService $telegramService;
    private readonly UserService $userService;

    /**
     * Create a new job instance.
     */
    public function __construct(
        private readonly UserFile $userFile
    )
    {
        //
    }

    /**
     * @todo We should work around with api exception limits and etc
     * Execute the job.
     */
    public function handle(
        ModerationService $moderationService,
        TelegramService $telegramService,
        UserService $userService,
    ): void
    {
        Log::debug('[ModeratePhotoUpdateJob] starting');

        $this->telegramService = $telegramService;
        $this->userService = $userService;
        $this->moderationService = $moderationService;

        $userDto = $userService->getById($this->userFile->user_id);

        $lastModeratedFile = UserFile::query()
            ->where('user_id', $this->userFile->user_id)
            ->where('is_under_moderation', true)
            ->latest()
            ->first();

        DB::beginTransaction();
        try {
            $moderation = $this->moderationService->checkPhoto($this->userFile);

            $this->userFile->is_under_moderation = false;
            $this->userFile->save();

            if ($moderation !== null) {
                $tgMessage = null;
                if ($lastModeratedFile === null || $lastModeratedFile->created_at->eq($this->userFile->created_at)) {
                    $tgMessage = TelegramMessageEnum::PHOTO_UPDATE_MODERATION_FAIL_MESSAGE;
                }

                $this->sendResult(
                    $moderation->rejection_reason,
                    $userDto,
                    $tgMessage,
                );
                DB::commit();
                PhotoModerationResultEvent::broadcast($userDto);
                return;
            }

            UserFile::query()->where('id', $this->userFile->file_id)->delete();
            DB::commit();

            // This is `kostyl` so we will send message about result of moderation only for last moderated photo
            if ($lastModeratedFile === null || $lastModeratedFile->created_at->eq($this->userFile->created_at)) {
                $telegramService->sendMessage($userDto->id, TelegramMessageEnum::PHOTO_UPDATE_MODERATION_SUCCESS_MESSAGE);
            }

        } catch (Exception $e) {
            DB::rollBack();

            Log::error($e->getMessage());

            $this->userFile->is_under_moderation = false;
            $this->userFile->save();

            $tgMessage = null;
            if ($lastModeratedFile === null || $lastModeratedFile->created_at->eq($this->userFile->created_at)) {
                $tgMessage = TelegramMessageEnum::PHOTO_UPDATE_MODERATION_FAIL_MESSAGE;
            }

            $this->sendResult(
                RejectionReasonEnum::USER_PROFILE_PHOTO_INTERNAL_ERROR,
                $userDto,
                $tgMessage
            );
        }

        PhotoModerationResultEvent::broadcast($userDto);

        Log::debug('[ModeratePhotoUpdateJob] finished');
    }


    private function sendResult(RejectionReasonEnum $rejectionReasonEnum, UserDto $userDto, TelegramMessageEnum|null $message): void
    {
        if ($message !== null) {
            $this->telegramService->sendMessage($userDto->id, $message);
        }

        PhotoModerationResultEvent::broadcast($userDto, $rejectionReasonEnum);
    }
}
