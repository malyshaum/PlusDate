<?php

namespace App\Http\Controllers\User;

use App\Dto\Storage\SaveFileDto;
use App\Dto\User\DeleteAccountDto;
use App\Dto\User\OnboardDto;
use App\Dto\User\RestoreAccountDto;
use App\Dto\User\UpdatePhotosDto;
use App\Dto\User\UpsertUserDto;
use App\Dto\User\UserSearchPreferenceDto;
use App\Enums\User\DeletionReasonEnum;
use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\DeleteAccountRequest;
use App\Http\Requests\User\GetAvailableSwipesRequest;
use App\Http\Requests\User\GetLikesRequest;
use App\Http\Requests\User\GetMatchesRequest;
use App\Http\Requests\User\GetSharedProfileRequest;
use App\Http\Requests\User\GetUserRequest;
use App\Http\Requests\User\OnboardRequest;
use App\Http\Requests\User\RestoreAccountRequest;
use App\Http\Requests\User\UpdatePhotosRequest;
use App\Http\Requests\User\UpdateUserSearchPreferencesRequest;
use App\Http\Requests\User\UploadVideoRequest;
use App\Http\Requests\User\UpsertUserProfileRequest;
use App\Http\Resources\User\UserResource;
use App\Mapping\User\ArrayToUserSearchPreferenceDtoMapper;
use App\Mapping\User\UserMapping;
use App\Models\Moderation\UserModeration;
use App\Models\User;
use App\Models\User\UserFile;
use App\Services\Chat\ChatService;
use App\Services\User\AccountDeletionService;
use App\Services\User\FileService;
use App\Services\User\UserService;
use AutoMapperPlus\AutoMapper;
use AutoMapperPlus\Exception\UnregisteredMappingException;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class UserProfileController extends Controller
{
    public function __construct(
        private readonly AutoMapper $mapper,
        private readonly UserService $userService,
        private readonly FileService $fileService,
        private readonly ChatService $chatService,
        private readonly AccountDeletionService $deletionService,
    ){
        //
    }

    public function getMatches(GetMatchesRequest $request): JsonResponse
    {
        return $this->response(
            $this->userService->getMatches(
                $request->validated('user_id'),
                $request->validated('cursor')
            )
        );
    }

    public function getById(GetUserRequest $request): UserResource
    {
        $user = User::query()->findOrFail($request->validated('id'));
        $isOwnProfile = $request->validated('user_id') === $user->id;

        $user->load([
            'feedProfile.activities',
            'validFiles',
            'settings'
        ]);

        if (!$isOwnProfile && $user->settings?->hide_age) {
            $user->feedProfile->age = null;
        }

        // TODO: kostyl
        $user->setRelation('files', $user->validFiles->isEmpty() ? null : $user->validFiles);

        return UserResource::make($user);
    }

    public function getSharedProfile(GetSharedProfileRequest $request): JsonResponse
    {
        $userId = $request->getId();

        $data = $this->userService->getById($userId);

        return $this->response($data?->toArray());
    }

    public function me(): UserResource
    {
        /** @var User $user */
        $user = Auth::user();

        $user->load([
            'feedProfile.activities',
            'searchPreference.city',
            'settings',
            'files.moderation',
            'moderation' => fn($query) => $query->where('is_resolved', false),
        ]);

        $fileIdsToRemove = $user->files->pluck('file_id')->filter();
        $user->setRelation('files',
            $user->files->reject(fn($file) => $fileIdsToRemove->contains($file->id))->values()
        );

        return UserResource::make($user);
    }

    /**
     * @throws UnregisteredMappingException
     * @throws Exception
     */
    public function upsert(UpsertUserProfileRequest $request): UserResource
    {
        /** @var UpsertUserDto $dto */
        /** @see  UpsertUserProfileRequestToUpsertUserProfileDtoMapper::mapToObject() */
        $dto = $this->mapper->map($request, UpsertUserDto::class);
        $this->userService->upsert($dto);

        $user = User::query()->findOrFail($dto->id);
        $user->load(['feedProfile', 'moderation', 'settings', 'validFiles']);

        $fileIdsToRemove = $user->files->pluck('file_id')->filter();
        $user->setRelation('files',
            $user->files->reject(fn($file) => $fileIdsToRemove->contains($file->id))->values()
        );

        return UserResource::make($user);
    }

    /**
     * @throws UnregisteredMappingException
     * @throws Exception
     */
    public function onboard(OnboardRequest $request): JsonResponse
    {
        /** @see OnboardRequestToOnboardDtoMapper */
        $onboardDto = $this->mapper->map($request, OnboardDto::class);

        return $this->response(
            $this->userService->onboardUser($onboardDto)
        );
    }

    /**
     * @throws UnregisteredMappingException
     */
    public function updatePreferences(UpdateUserSearchPreferencesRequest $request): Response|JsonResponse
    {
        /** @see ArrayToUserSearchPreferenceDtoMapper::mapToObject */
        $dto = $this->mapper->map($request->validated(), UserSearchPreferenceDto::class);

        $dto = $this->userService->upsertSearchPreference($dto);

        return $this->response($dto);
    }

    /**
     * @throws ApiException
     */
    public function getLikes(GetLikesRequest $request): JsonResponse
    {
        $pagination = $this->userService->getLikes(
            $request->validated('user_id'),
            $request->validated('cursor'),
            $request->validated('only_mutual', false)
        );

        return $this->response($pagination);
    }

    // TODO: move to FileController
    /**
     * @throws UnregisteredMappingException|ApiException
     */
    public function updatePhotos(UpdatePhotosRequest $request): JsonResponse
    {
        /** @see UserMapping::updatePhotosRequestToUpdatePhotosDto */
        $dto = $this->mapper->map($request, UpdatePhotosDto::class);

        $this->userService->updatePhotos($dto);

        return $this->response();
    }


    // TODO: move to FileController
    public function files(): Response|JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $fileIdsToRemove = $user->files->pluck('file_id')->filter();
        $user->setRelation('files',
            $user->files->reject(fn($file) => $fileIdsToRemove->contains($file->id))->values()
        );

        $resource = UserResource::make($user)->resolve();

        return $this->response($resource['files']);
    }

    // TODO: move to FileController
    /**
     * @throws UnregisteredMappingException
     * @throws ApiException
     */
    public function uploadVideo(UploadVideoRequest $request): JsonResponse
    {
        /** @var SaveFileDto $dto */
        /** @see UserMapping::arrayToSaveFileDto() */
        $dto = $this->mapper->map($request->validated(), SaveFileDto::class);

        $dto->deleteParent = true;
        $this->fileService->saveFile($dto);

        return $this->response();
    }

    // TODO: move to FileController
    // TODO: move logic to service
    public function deleteVideo(int $id): JsonResponse
    {
        $file = UserFile::query()
            ->where('user_id', Auth::id())
            ->findOrFail($id);

        Storage::delete($file->filepath);
        $file->delete();

        UserModeration::query()
            ->where('user_id', Auth::id())
            ->where('user_file_id', $id)
            ->delete();

        $unresolvedModeration = UserModeration::query()
            ->where('user_id', Auth::id())
            ->where('is_resolved', false)
            ->exists();

        if ($unresolvedModeration === false) {
            User::query()
                ->where('id', Auth::id())
                ->update([
                    'is_under_moderation' => false
                ]);
        }

        return $this->response();
    }

    // TODO: move to FileController
    public function setMainPhoto(int $photoId): UserResource
    {
        $this->userService->setMainPhoto($photoId, Auth::id());

        return $this->me();
    }

    public function availableSwipes(GetAvailableSwipesRequest $request): JsonResponse
    {
        $usedSwipes = $this->userService->usedSwipes($request->validated('user_id'));

        return $this->response($usedSwipes);
    }

    /**
     * @throws ApiException
     * @throws UnregisteredMappingException
     */
    public function getStats(): JsonResponse
    {
        $userId = Auth::id();

        return $this->response([
            'matches' => $this->userService->getMatchCount($userId),
            'unread_chats' => $this->chatService->getChatsWithUnreadMessages($userId)->total,
            'unresolved_likes' => $this->userService->getLikes($userId, null)->total
        ]);
    }

    /**
     * @throws Exception
     */
    public function deleteAccount(DeleteAccountRequest $request): JsonResponse
    {
        $dto = new DeleteAccountDto();
        $dto->userId = auth()->id();
        $dto->reasons = array_map(
            fn($reason) => DeletionReasonEnum::from($reason),
            $request->validated('reasons')
        );
        $dto->note = $request->validated('note');
        $dto->isAdminDelete = false;

        $this->deletionService->softDeleteAccount($dto);

        return $this->response(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * @throws Exception
     */
    public function restoreAccount(RestoreAccountRequest $request): UserResource
    {
        $dto = new RestoreAccountDto();
        $dto->userId = $request->validated('user_id');

        $this->deletionService->restoreAccount($dto->userId);

        $user = User::query()
            ->with(['feedProfile', 'settings', 'files'])
            ->findOrFail($dto->userId);

        return UserResource::make($user);
    }
}
