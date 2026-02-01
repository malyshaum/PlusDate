<?php

declare(strict_types=1);

namespace App\Services\User;

use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Repositories\ChatRepositoryInterface;
use App\Repositories\User\UserBlockRepositoryInterface;
use App\Repositories\User\UserSwipeRepositoryInterface;

readonly class UserBlockingService implements UserBlockingServiceInterface
{
    public function __construct(
        private UserBlockRepositoryInterface $blockRepository,
        private ChatRepositoryInterface $chatRepository,
        private UserSwipeRepositoryInterface $swipeRepository,
    ) {
    }

    public function blockUser(int $userId, int $blockedUserId): void
    {
        DB::beginTransaction();
        try {
            $this->blockRepository->blockUser($userId, $blockedUserId);

            $this->chatRepository->softDeleteChatsBetweenUsers($userId, $blockedUserId);

            $this->swipeRepository->softDeleteSwipesBetweenUsers($userId, $blockedUserId);

            DB::commit();
        } catch (Exception $exception) {
            DB::rollBack();
            Log::error('Failed to block user', [
                'user_id' => $userId,
                'blocked_user_id' => $blockedUserId,
                'error' => $exception->getMessage(),
            ]);
            throw $exception;
        }
    }

    public function unblockUser(int $userId, int $blockedUserId): void
    {
        DB::beginTransaction();
        try {
            $this->blockRepository->unblockUser($userId, $blockedUserId);

            $this->chatRepository->restoreChatsBetweenUsers($userId, $blockedUserId);

            $this->swipeRepository->restoreSwipesBetweenUsers($userId, $blockedUserId);

            DB::commit();
        } catch (Exception $exception) {
            DB::rollBack();
            Log::error('Failed to unblock user', [
                'user_id' => $userId,
                'blocked_user_id' => $blockedUserId,
                'error' => $exception->getMessage(),
            ]);
            throw $exception;
        }
    }

}
