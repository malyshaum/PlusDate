<?php

namespace App\Services\User;

use App\Clients\RabbitMQClient;
use App\Dto\User\DeleteAccountDto;
use App\Dto\User\UserDto;
use App\Enums\Core\ErrorMessageEnum;
use App\Enums\Payment\SubscriptionDriverEnum;
use App\Exceptions\ApiException;
use App\Mapping\User\UserToUserDtoMapper;
use App\Models\Moderation\UserModeration;
use App\Models\User;
use App\Models\User\UserDeletionSnapshot;
use App\Models\User\UserFile;
use App\Models\User\UserSwipe;
use App\Services\Payment\PremiumNotificationServiceInterface;
use App\Services\Subscription\SubscriptionManager;
use App\Services\TelegramService;
use AutoMapperPlus\AutoMapper;
use AutoMapperPlus\Exception\UnregisteredMappingException;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

readonly class AccountDeletionService
{
    public function __construct(
        private TelegramService $telegramService,
        private AutoMapper $mapper,
        private SubscriptionManager $subscriptionManager,
        private RabbitMQClient $rabbitMQClient,
        private PremiumNotificationServiceInterface $notificationService,
    ) {
    }

    /**
     * @throws UnregisteredMappingException
     */
    public function softDeleteAccount(DeleteAccountDto $dto): void
    {
        DB::beginTransaction();
        try {
            $user = User::query()
                ->withTrashed()
                ->with(['feedProfile', 'settings', 'searchPreference', 'files'])
                ->findOrFail($dto->userId);

            if ($user?->deleted_at) {
                return;
            }

            $this->createSnapshot($user, $dto);

            $user->delete();

            if (!$dto->isAdminDelete) {
                $userDto = $this->mapper->map($user, UserDto::class);
                $this->telegramService->sendDeletionReport($userDto, $dto->reasons, $dto->note);
            }

            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to soft delete account', [
                'user_id' => $dto->userId,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * @throws Exception
     */
    public function hardDeleteAccount(int $userId): void
    {
        DB::beginTransaction();
        try {
            /** @var User $user */
            $user = User::withTrashed()->findOrFail($userId);

            $this->notificationService->notifyPremiumExpired(userId: $userId, withDeleted: true);

            $this->subscriptionManager->driver(SubscriptionDriverEnum::TELEGRAM)->cancel($user);
            $this->subscriptionManager->driver(SubscriptionDriverEnum::STRIPE)->cancel($user);

            $this->deleteUserData($user);

            UserDeletionSnapshot::query()
                ->where('user_id', $userId)
                ->whereNull('hard_deleted_at')
                ->update(['hard_deleted_at' => now()]);

            $user->forceDelete();

            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to hard delete account', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * @throws UnregisteredMappingException
     * @throws ApiException
     * @throws Exception
     */
    public function restoreAccount(int $userId): UserDto
    {
        DB::beginTransaction();
        try {
            $user = User::onlyTrashed()->findOrFail($userId);

            $snapshot = UserDeletionSnapshot::query()->where('user_id', $userId)
                ->whereNull('hard_deleted_at')
                ->latest('deleted_at')
                ->firstOrFail();

            if ($snapshot->can_restore_until && now()->isAfter($snapshot->can_restore_until)) {
                throw new ApiException(ErrorMessageEnum::RESTORE_PERIOD_EXPIRED);
            }

            $user->restore();

            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to restore account', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }

        /** @see UserToUserDtoMapper::mapToObject() */
        $userDto = $this->mapper->map($user, UserDto::class);

        $this->rabbitMQClient->publishToExchange(
            UserService::MQ_EXCHANGE,
            UserService::MQ_ROUTING_KEY,
            $userDto->toArray()
        );

        return $userDto;
    }

    private function createSnapshot(User $user, DeleteAccountDto $dto): void
    {
        $statistics = $this->gatherStatistics($user);

        UserDeletionSnapshot::query()->create([
            'user_id' => $user->id,
            'deletion_type' => $dto->isAdminDelete ? 'ADMIN_PERMANENT' : 'USER_REQUESTED',
            'deletion_reasons' => array_map(fn($reason) => $reason->value, $dto->reasons),
            'deletion_note' => $dto->note,
            'user_profile' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'age' => $user->feedProfile?->age,
                'gender' => $user->feedProfile?->sex,
            ],
            'full_profile' => [
                'user' => $user->toArray(),
                'feed_profile' => $user->feedProfile?->toArray(),
                'settings' => $user->settings?->toArray(),
                'search_preferences' => $user->searchPreference?->toArray(),
            ],
            'statistics' => $statistics,
            'deleted_by' => $dto->deletedBy,
            'can_restore_until' => $dto->isAdminDelete ? null : now()->addDays(30),
            'deleted_at' => now(),
        ]);
    }

    private function gatherStatistics(User $user): array
    {
        return [
            'photos_count' => $user->photos()->count(),
            'videos_count' => $user->videos()->count(),
            'swipes_count' => UserSwipe::query()->where('user_id', $user->id)->count(),
            'matches_count' => UserSwipe::query()->where('user_id', $user->id)
                ->where('is_match', true)
                ->count(),
            'received_swipes_count' => $user->feedProfile
                ? UserSwipe::query()->where('profile_id', $user->feedProfile->id)->count()
                : 0,
            'chats_count' => $user->chats()->count(),
            'messages_sent_count' => $user->sentMessages()->count(),
        ];
    }

    private function deleteUserData(User $user): void
    {
        $filePaths = UserFile::withTrashed()
            ->where('user_id', $user->id)
            ->pluck('filepath');

        UserFile::withTrashed()->where('user_id', $user->id)->forceDelete();

        UserSwipe::query()->where('user_id', $user->id)->delete();
        if ($user->feedProfile) {
            UserSwipe::query()->where('profile_id', $user->feedProfile->id)->delete();
        }

        UserModeration::query()->where('user_id', $user->id)->delete();

        DB::table('user_bot_notifications')->where('user_id', $user->id)->delete();

        $subscriptionIds = DB::table('subscriptions')
            ->where('user_id', $user->id)
            ->pluck('id');

        if ($subscriptionIds->isNotEmpty()) {
            DB::table('subscription_items')
                ->whereIn('subscription_id', $subscriptionIds)
                ->delete();
        }

        DB::table('subscriptions')->where('user_id', $user->id)->delete();

        DB::table('telegram_subscriptions')->where('user_id', $user->id)->delete();

        DB::table('transactions')->where('user_id', $user->id)->delete();

        DB::table('personal_access_tokens')
            ->where('tokenable_type', User::class)
            ->where('tokenable_id', $user->id)
            ->delete();

        if ($user->feedProfile) {
            $user->feedProfile->delete();
        }

        if ($user->settings) {
            $user->settings->delete();
        }

        if ($user->searchPreference) {
            $user->searchPreference->delete();
        }

        foreach ($filePaths as $path) {
            try {
                Storage::delete($path);
            } catch (Exception $e) {
                Log::warning('Failed to delete file from storage', [
                    'path' => $path,
                    'error' => $e->getMessage()
                ]);
            }
        }
    }
}
