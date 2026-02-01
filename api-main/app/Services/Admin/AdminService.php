<?php

namespace App\Services\Admin;

use App\Dto\User\DeleteAccountDto;
use App\Enums\Telegram\TelegramMessageEnum;
use App\Enums\User\DeletionReasonEnum;
use App\Models\User;
use App\Models\User\UserFeedProfile;
use App\Services\TelegramService;
use App\Services\User\AccountDeletionService;
use Exception;
use Illuminate\Support\Facades\DB;
use Throwable;

readonly class AdminService
{
    public function __construct(
        private AccountDeletionService $deletionService,
        private TelegramService $telegramService,
    ) {
    }

    /**
     * @throws Exception
     */
    public function permanentlyDeleteAccount(array $data): void
    {
        $dto = new DeleteAccountDto();
        $dto->userId = $data['user_id'];
        $dto->reasons = array_map(
            static fn($reason): DeletionReasonEnum  => DeletionReasonEnum::from($reason),
            $data['reasons']
        );
        $dto->note = $data['note'] ?? null;
        $dto->isAdminDelete = true;
        $dto->deletedBy = $data['admin_user_id'] ?? null;

        $this->sendNotificationIfNeeded($dto);

        $this->deletionService->softDeleteAccount($dto);

        $this->deletionService->hardDeleteAccount($dto->userId);
    }

    /**
     * @param array $data
     * @return void
     * @throws Throwable
     * @todo Use dto
     */
    public function updateUser(array $data): void
    {
        /** @var User $user */
        $user = User::query()->findOrFail($data['user_id']);

        DB::beginTransaction();
        try {
            if (isset($data['name'])) {
                $user->name = $data['name'];
                $user->save();
            }

            if (isset($data['gender'])) {
                UserFeedProfile::query()
                    ->where('user_id', $user->id)
                    ->update(['sex' => $data['gender']]);
            }
            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            throw $exception;
        }
    }

    public function updateUserBlockedStatus(int $userId, bool $blocked): void
    {
        User::query()->findOrFail($userId)?->update([
            'blocked' => $blocked,
            'blocked_at' => $blocked ? now() : null,
        ]);
    }

    private function sendNotificationIfNeeded(DeleteAccountDto $dto): void
    {
        $hasGeneralReason = in_array(DeletionReasonEnum::GENERAL_REASON, $dto->reasons, true);

        if (!$hasGeneralReason) {
            return;
        }

        $this->telegramService->sendMessage(
            $dto->userId,
            TelegramMessageEnum::ACCOUNT_DELETED_BY_ADMIN_MESSAGE
        );
    }
}
