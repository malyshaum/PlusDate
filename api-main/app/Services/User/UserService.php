<?php

namespace App\Services\User;

use App\Clients\RabbitMQClient;
use App\Dto\CursorCollectionDto;
use App\Dto\Storage\SaveFileDto;
use App\Dto\User\OnboardDto;
use App\Dto\User\UpdatePhotosDto;
use App\Dto\User\UpsertUserDto;
use App\Dto\User\UserDto;
use App\Dto\User\UserSearchPreferenceDto;
use App\Enums\Core\ErrorMessageEnum;
use App\Enums\Core\FileTypeEnum;
use App\Enums\Core\GenderEnum;
use App\Enums\Core\SwipeActionEnum;
use App\Enums\Moderation\RejectionReasonEnum;
use App\Enums\Payment\SubscriptionTypeEnum;
use App\Enums\Telegram\TelegramMessageEnum;
use App\Exceptions\ApiException;
use App\Jobs\Moderation\ModeratePhotoUpdateJob;
use App\Jobs\Moderation\ValidateUserProfileJob;
use App\Mapping\User\ArrayToUserSearchPreferenceDtoMapper;
use App\Mapping\User\UserToUserDtoMapper;
use App\Models\Chat;
use App\Models\Dictionary\City;
use App\Models\Dictionary\Country;
use App\Models\Moderation\UserModeration;
use App\Services\Payment\PremiumNotificationServiceInterface;
use App\Models\User;
use App\Models\User\UserFeedProfile;
use App\Models\User\UserFile;
use App\Models\User\UserSearchPreference;
use App\Models\User\UserSettings;
use App\Models\User\UserSwipe;
use App\Services\TelegramService;
use AutoMapperPlus\AutoMapper;
use AutoMapperPlus\Exception\UnregisteredMappingException;
use Exception;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

//todo class too big
readonly class UserService
{
    // TODO: move to enum consts
    public const string MQ_EXCHANGE = 'plusdate';
    public const string MQ_ROUTING_KEY = 'profile';

    public function __construct(
        private AutoMapper             $mapper,
        private FileService            $userFileService,
        private UserFeedProfileService $userFeedProfileService,
        private TelegramService        $telegramService,
        private SwipeLimitService      $swipeLimitService,
        private PremiumGrantService    $premiumGrantService,
        private RabbitMQClient         $rabbitMQClient,
        private PremiumNotificationServiceInterface $notificationService,
    )
    {

    }

    public function upsert(UpsertUserDto $dto): UserDto
    {
        DB::beginTransaction();
        try {
            $user = User::query()->updateOrCreate(['id' => $dto->id], $dto->toArray());

            if (isset($dto->settings)) {
                UserSettings::query()->updateOrCreate(['user_id' => $user->id], $dto->settings->toArray());
            }

            if (!empty($dto->feedProfile)) {
                $this->userFeedProfileService->upsert($dto->feedProfile);
            }

            if (!empty($dto->searchPreference)) {
                UserSearchPreference::query()
                    ->updateOrCreate([
                        'user_id' => $user->id,
                    ], $dto->searchPreference->toArray());
            }

            DB::commit();

            $user->load(['feedProfile.activities', 'settings']);

            /** @var UserDto $userDto */
            /** @see UserToUserDtoMapper::mapToObject() */
            $userDto = $this->mapper->map($user, UserDto::class);
        } catch (Exception $exception) {
            DB::rollBack();
            throw $exception;
        }

        $this->rabbitMQClient->publishToExchange(
            self::MQ_EXCHANGE,
            self::MQ_ROUTING_KEY,
            $userDto->toArray()
        );

        return $userDto;
    }

    // TODO: move to UserRepo
    public function getMatches(int $userId, string|null $cursor = null): CursorCollectionDto
    {
        $query = UserSwipe::query()
            ->select([
                'user_swipes.is_viewed',
                'user_swipes.created_at',
            ])
            ->where('user_swipes.user_id', $userId)
            ->where('user_swipes.is_match', true)
            ->join('user_feed_profile', 'user_feed_profile.id', '=', 'user_swipes.profile_id')
            ->join('users', function ($join) {
                $join->on('user_feed_profile.user_id', '=', 'users.id')
                    ->whereNull('users.deleted_at')
                    ->where('users.blocked', false);
            })
            ->addSelect(['users.id as user_id', 'user_feed_profile.id as profile_id', 'users.name as user_name', 'users.last_active_at', 'users.is_premium', 'user_feed_profile.age'])
            ->selectSub(
                UserFile::query()
                    ->select('filepath')
                    ->whereColumn('user_id', 'users.id')
                    ->where('is_main', true)
                    ->where('is_under_moderation', false)
                    ->whereDoesntHave('moderation')
                    ->where('type', FileTypeEnum::IMAGE)
                    ->latest()
                    ->limit(1),
                'filepath'
            )
            ->addSelect(DB::raw('(
                SELECT cu1.chat_id FROM chat_users cu1
                JOIN chat_users cu2 ON cu2.chat_id = cu1.chat_id AND cu2.user_id = users.id
                WHERE cu1.user_id = ' . $userId . '
                LIMIT 1
            ) as chat_id'))
            ->whereNotExists(function ($query) use ($userId) {
                $query->select(DB::raw(1))
                    ->from('chat_users as cu1')
                    ->join('chat_users as cu2', function ($join) {
                        $join->on('cu2.chat_id', '=', 'cu1.chat_id')
                            ->on('cu2.user_id', '=', 'users.id');
                    })
                    ->join('chat_messages', 'chat_messages.chat_id', '=', 'cu1.chat_id')
                    ->where('cu1.user_id', $userId);
            })
            ->orderBy('user_swipes.created_at', 'desc');

        $paginated = $query->cursorPaginate(20, ['*'], 'cursor', $cursor);

        $cursorCollection = new CursorCollectionDto();
        $cursorCollection->data = collect($paginated->items())->map(function ($match) {
            if ($match->filepath) {
                $filename = FileService::PREFIX_MEDIUM . basename($match->filepath);
                $mediumPath = Str::replace(basename($match->filepath), $filename, $match->filepath);
                $filepath = Storage::exists($mediumPath) ? $mediumPath : $match->filepath;
                $match->url = Storage::temporaryUrl($filepath, Carbon::now()->addDay());
            }
            return $match;
        });
        $cursorCollection->cursor = $cursor;
        $cursorCollection->nextCursor = $paginated->nextCursor()?->encode();
        $cursorCollection->prevCursor = $paginated->previousCursor()?->encode();
        $cursorCollection->hasMore = $paginated->hasMorePages();
        $cursorCollection->total = $query->count();

        return $cursorCollection;
    }

    /**
     * @throws Exception
     */
    public function onboardUser(OnboardDto $dto): UserDto|null
    {
        DB::beginTransaction();
        try {
            $user = User::query()->updateOrCreate([
                'id' => $dto->userId
            ], $dto->toArray());

            /** @var City $city */
            $city = City::query()->find($dto->feedProfile->cityId);
            $dto->feedProfile->coordinates = $city->location;

            /** @var Country $country */
            $country = Country::query()
                ->where('country_code', $city->country_code)
                ->first();

            $dto->feedProfile->countryId = $country->id;

            $feedProfileData = $dto->feedProfile->toArray();
            $activityIds = $feedProfileData['activity_ids'] ?? null;
            unset($feedProfileData['activity_ids']);

            $feedProfile = UserFeedProfile::query()->updateOrCreate([
                'user_id' => $user->id
            ], $feedProfileData);

            if ($activityIds !== null) {
                $feedProfile->activities()->sync($activityIds);
            }

            $searchPreferenceData = $dto->searchPreference->toArray();
            $searchPreferenceActivityIds = $searchPreferenceData['activity_ids'] ?? null;

            if ($searchPreferenceActivityIds !== null) {
                $searchPreferenceData['activity_ids'] = $searchPreferenceActivityIds;
            }

            UserSearchPreference::query()->updateOrCreate([
                'user_id' => $user->id
            ], $searchPreferenceData);

            UserSettings::query()->updateOrCreate([
                'user_id' => $user->id
            ],
                $dto->settings->toArray()
            );

            UserFile::query()
                ->where('user_id', $user->id)
                ->update([
                    'is_under_moderation' => true,
                    'is_main' => false
                ]);

            UserFile::query()
                ->where('user_id', $user->id)
                ->orderBy('id')
                ->first()
                ->update(['is_main' => true]);

            $gender = $dto->feedProfile->sex;

            if ($gender === GenderEnum::FEMALE && !$user->is_premium) {
                $this->premiumGrantService->grantInitialPremiumToWoman($user->id);
            } elseif ($gender === GenderEnum::MALE && !$user->is_premium) {
                $this->swipeLimitService->initializeUserState($user->id);
            }

            DB::commit();
        } catch (Exception $exception) {
            DB::rollBack();
            throw $exception;
        }


        $userDto = $this->getById($user->id);

        ValidateUserProfileJob::dispatch($userDto)->onQueue('admin-verification');

        return $userDto;
    }

    /**
     * @throws UnregisteredMappingException
     */
    public function getById(int $userId): UserDto|null
    {
        $user = User::query()->withTrashed()->with('feedProfile')->find($userId);
        if ($user === null) {
            return null;
        }

        /** @see UserToUserDtoMapper::mapToObject() */
        return $this->mapper->map($user, UserDto::class);
    }

    /**
     * @throws UnregisteredMappingException
     */
    public function upsertSearchPreference(UserSearchPreferenceDto $preferenceDto): UserSearchPreferenceDto
    {
        $searchPreferenceData = $preferenceDto->toArray();
        $activityIds = $preferenceDto->activityIds ?? null;

        if ($activityIds !== null) {
            $searchPreferenceData['activity_ids'] = $activityIds;
        }

        $preferences = UserSearchPreference::query()->updateOrCreate([
            'user_id' => $preferenceDto->userId
        ], $searchPreferenceData);

        $preferenceArray = $preferences->toArray();

        /** @see ArrayToUserSearchPreferenceDtoMapper::mapToObject */
        return $this->mapper->map($preferenceArray, UserSearchPreferenceDto::class);
    }

    /**
     * @throws ApiException
     */
    public function getLikes(int $userId, string|null $cursor, bool $onlyMutual = false): CursorCollectionDto
    {
        $userProfileDto = $this->userFeedProfileService->getByUserId($userId);
        if ($userProfileDto === null) {
            throw new ApiException(ErrorMessageEnum::VALIDATION_USER_DOES_NOT_HAVE_FEED_PROFILE);
        }

        $currentUserId = $userId;
        $myProfileId = $userProfileDto->id;

        // Base query to get likes
        $query = UserSwipe::query()
            ->select('user_swipes.*')
            ->where('profile_id', $myProfileId)
            ->whereIn('action', [SwipeActionEnum::LIKE, SwipeActionEnum::SUPERLIKE]);

        // Filter users
        $query->join('users', 'user_swipes.user_id', '=', 'users.id')
            ->where('users.is_under_moderation', false)
            ->where('users.is_onboarded', true)
            ->where('users.blocked', false)
            ->where('users.deleted_at','=', null);

        $query->where('is_match', $onlyMutual);

        $query->whereNotExists(function ($subQuery) use ($currentUserId) {
            $subQuery->select(DB::raw(1))
                ->from('user_swipes as my_dislikes')
                ->join('user_feed_profile as liked_user_profile', 'my_dislikes.profile_id', '=', 'liked_user_profile.id')
                ->where('my_dislikes.user_id', $currentUserId)
                ->where('my_dislikes.action', SwipeActionEnum::DISLIKE->value)
                ->whereColumn('liked_user_profile.user_id', 'user_swipes.user_id')
                ->whereColumn('my_dislikes.updated_at', '>', 'user_swipes.created_at');
        });

        $query->with(['user.feedProfile', 'user.files', 'user.settings']);

        $paginated = $query
            ->orderByRaw("CASE WHEN user_swipes.action = '" . SwipeActionEnum::SUPERLIKE->value ."' THEN 0 ELSE 1 END ASC")
            ->orderBy('user_swipes.created_at', 'desc')
            ->orderBy('user_swipes.id', 'desc')
            ->cursorPaginate(20, ['*'], 'cursor', $cursor);

        $mutualUserIds = collect($paginated->items())
            ->filter(fn($swipe) => $swipe->is_match)
            ->pluck('user_id');

        $chats = $mutualUserIds->isNotEmpty()
            ? Chat::getChatsBetweenUserAndOthers($currentUserId, $mutualUserIds->toArray())
            : collect();

        $data = $paginated->getCollection()->map(function ($swipe) use ($chats, $currentUserId) {
            $chat = $chats->first(function ($c) use ($swipe, $currentUserId) {
                return $c->users->contains('id', $swipe->user_id);
            });

            $user = $swipe->user->toArray();

            $shouldHideAge = $swipe->user?->settings?->hide_age ?? false;
            if ($shouldHideAge) {
                unset($user['feed_profile']['age']);
            }

            return [
                ...$swipe->toArray(),
                'is_mutual' => (bool) $swipe->is_match,
                'chat' => $chat,
                'user' => [
                    ...$user,
                    'files' => $this->prepareFiles($swipe),
                ]
            ];
        });

        $cursorCollection = new CursorCollectionDto();
        $cursorCollection->data = $data;
        $cursorCollection->cursor = $cursor;
        $cursorCollection->nextCursor = $paginated->nextCursor()?->encode();
        $cursorCollection->prevCursor = $paginated->previousCursor()?->encode();
        $cursorCollection->hasMore = $paginated->hasMorePages();
         $cursorCollection->total = $query->count();

        return $cursorCollection;
    }

    /**
     * @throws UnregisteredMappingException
     */
    public function getSearchPreferenceDto(int $userId): ?array
    {
        $preference = UserSearchPreference::query()
            ->with(['city'])
            ->where('user_id', $userId)
            ->first();

        if ($preference === null) {
            return null;
        }

        return $preference->toArray();
    }

    /**
     * @throws ApiException
     */
    public function updatePhotos(UpdatePhotosDto $dto): void
    {
        $userDto = $this->getById($dto->userId);

        foreach ($dto->photos as $photoData) {
            DB::beginTransaction();
            try {
                $saveDto = new SaveFileDto();
                $saveDto->userId = $dto->userId;
                $saveDto->file = $photoData['file'];
                $saveDto->fileId = $photoData['file_id'];
                $saveDto->fileType = FileTypeEnum::IMAGE;
                $saveDto->isUnderModeration = true;
                $saveDto->order = $photoData['order'] ?? null;

                if ($saveDto->fileId !== null) {
                    $isMainPhotoReplaced = UserFile::query()
                        ->where('id', $saveDto->fileId)
                        ->where('user_id', $userDto->id)
                        ->where('is_main', true)
                        ->exists();
                    $saveDto->isMain = $isMainPhotoReplaced;
                }

                $userFile = $this->userFileService->saveFile($saveDto);
                DB::commit();
            }catch (Exception $exception){
                DB::rollBack();
                Log::error($exception->getMessage());
                throw new $exception;
            }
            ModeratePhotoUpdateJob::dispatch($userFile);
        }

        $this->telegramService->sendMessage(
            $userDto->id,
            TelegramMessageEnum::PHOTO_UPDATE_MODERATION_START_MESSAGE
        );
    }

    public function grantSubscription(int $userId, SubscriptionTypeEnum $subscriptionType): void
    {
        $user = User::query()->findOrFail($userId);

        DB::beginTransaction();
        try {
            $endsAt = match($subscriptionType) {
                SubscriptionTypeEnum::WEEK => now()->addWeek(),
                SubscriptionTypeEnum::MONTH => now()->addMonth(),
                SubscriptionTypeEnum::THREE_MONTH => now()->addMonths(3),
            };

            DB::table('subscriptions')->insert([
                'user_id' => $userId,
                'type' => $subscriptionType->value,
                'stripe_id' => 'telegram_stars_' . uniqid(),
                'stripe_status' => 'active',
                'stripe_price' => null,
                'quantity' => 1,
                'trial_ends_at' => null,
                'ends_at' => $endsAt,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $wasPremium = $user->is_premium;
            $user->is_premium = true;
            $user->save();

            if (!$wasPremium) {
                $this->notificationService->notifyPremiumStarted($userId);
            }

            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to grant subscription', [
                'user_id' => $userId,
                'type' => $subscriptionType->value,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * TODO: This method should be in admin service this is only for second moderation flow
     * @throws ApiException
     */
    public function updateFiles(array $filesToSave): void
    {
        DB::beginTransaction();
        try {
            /** @var SaveFileDto $fileData */
            foreach ($filesToSave as $fileData) {

                if ($fileData->fileId !== null) {
                    $userFile = UserFile::query()->select('is_main')->where('id', $fileData->fileId)->first();
                    if ($userFile && $userFile->is_main === true) {
                        $fileData->isMain = true;
                    }
                }

                $fileData->deleteParent = true;

                $this->userFileService->saveFile($fileData);

                UserModeration::query()
                    ->where('user_id', $fileData->userId)
                    ->where('user_file_id', $fileData->fileId)
                    ->update(['is_resolved' => true]);
            }

            DB::commit();
        } catch (Exception $exception) {
            DB::rollBack();
            Log::error($exception->getMessage());
            throw new $exception;
        }
    }

    // TODO: add dto, move to moderation service
    public function moderationUpdate(int $userId, array $data): void
    {
        $user = User::query()->withTrashed()->findOrFail($userId);

        if (isset($data['name'])) {
            UserModeration::query()
                ->where('user_id', $userId)
                ->where('rejection_reason', RejectionReasonEnum::NAME_INAPPROPRIATE)
                ->update(['is_resolved' => true]);

            $user->update(['name' => $data['name']]);
        }

        if (isset($data['instagram'])) {
            UserModeration::query()
                ->where('user_id', $userId)
                ->where('rejection_reason', RejectionReasonEnum::INSTAGRAM_INAPPROPRIATE)
                ->update(['is_resolved' => true]);

            $user->update(['instagram' => $data['instagram']]);
        }

        if (isset($data['profile_description'])) {
            UserModeration::query()
                ->where('user_id', $userId)
                ->where('rejection_reason', RejectionReasonEnum::DESCRIPTION_INAPPROPRIATE)
                ->update(['is_resolved' => true]);

            $user->update(['profile_description' => $data['profile_description']]);
        }
    }

    public function setMainPhoto(int $photoId, int $userId): void
    {
        DB::beginTransaction();
        try {
            UserFile::query()
                ->where('user_id', $userId)
                ->where('type', FileTypeEnum::IMAGE)
                ->where('is_main', true)
                ->update(['is_main' => false]);

            UserFile::query()
                ->where('id', $photoId)
                ->where('user_id', $userId)
                ->where('type', FileTypeEnum::IMAGE)
                ->update(['is_main' => true]);
            DB::commit();
        }   catch (Exception $exception) {
            DB::rollBack();
            Log::error($exception->getMessage());
        }
    }

    public function getMatchCount(int $userId): int
    {
        return UserSwipe::query()
            ->where('user_swipes.user_id', $userId)
            ->where('user_swipes.is_match', true)
            ->join('user_feed_profile', 'user_feed_profile.id', '=', 'user_swipes.profile_id')
            ->join('users', function ($join) {
                $join->on('user_feed_profile.user_id', '=', 'users.id')
                    ->whereNull('users.deleted_at')
                    ->where('users.blocked', false);
            })
            ->whereNotExists(function ($query) use ($userId) {
                $query->select(DB::raw(1))
                    ->from('chat_users as cu1')
                    ->join('chat_users as cu2', function ($join) {
                        $join->on('cu2.chat_id', '=', 'cu1.chat_id')
                            ->on('cu2.user_id', '=', 'users.id');
                    })
                    ->join('chat_messages', 'chat_messages.chat_id', '=', 'cu1.chat_id')
                    ->where('cu1.user_id', $userId);
            })
            ->count();
    }

    public function getUserGender(int $userId): string
    {
        $gender = UserFeedProfile::query()
            ->where('user_id', $userId)
            ->value('sex');

        return $gender ?? 'male';
    }

    public function usedSwipes(int $userId): array
    {
        $userDto = $this->getById($userId);
        $gender = $this->getUserGender($userId);

        return $this->swipeLimitService->getAvailableSwipes($userId, $userDto->isPremium, $gender);
    }

    // TODO: should be moved to FilesService
    private function prepareFiles(UserSwipe $swipe): array
    {
        $userFiles = $swipe->user->validFiles;

        // TODO: remove auth facade
        $isUserPremium = Auth::user()->is_premium;

        $isSwipeFromPremium = $swipe->user->is_premium ?? false;
        $isSuperlike = $swipe->action === SwipeActionEnum::SUPERLIKE->value;
        $shouldBlur = $isUserPremium === false && !($isSwipeFromPremium && $isSuperlike);

        return $userFiles->map(function (UserFile $file) use ($shouldBlur) {
            $data = $file->toArray();

            if ($file->type === FileTypeEnum::VIDEO->value) {
                $thumbnail = Str::replace('.mp4','.webp', basename($file->filepath));

                if ($shouldBlur) {
                    $thumbnail = 'blurred_'.$thumbnail;
                }

                $thumbnailPath = Str::replace(basename($file->filepath), $thumbnail, $file->filepath);
                $data['thumbnail_url'] = Storage::temporaryUrl(
//                    Storage::exists($thumbnailPath) ? $thumbnailPath : $file->filepath,
                    $thumbnailPath,
                    Carbon::now()->addDay()
                );

                return $data;
            }

            $filename = basename($file->filepath);

            if ($file->type === FileTypeEnum::IMAGE->value && $shouldBlur) {
                $filename = FileService::PREFIX_BLURRED.$filename;
            } elseif ($file->type === FileTypeEnum::IMAGE->value) {
                $filename = FileService::PREFIX_MEDIUM.$filename;
            }

            $prefixedPath = Str::replace(basename($file->filepath), $filename, $file->filepath);
            $data['url'] = Storage::temporaryUrl(
//                Storage::exists($prefixedPath) ? $prefixedPath : $file->filepath,
                $prefixedPath,
                Carbon::now()->addDay()
            );

            return $data;
        })->toArray();
    }
}
