<?php

namespace App\Http\Controllers\Moderation;

use App\Dto\Storage\SaveFileDto;
use App\Enums\Core\FileTypeEnum;
use App\Enums\Telegram\TelegramMessageEnum;
use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Moderation\GetModerationProfilesRequest;
use App\Http\Requests\Moderation\UpdateModerationStatusRequest;
use App\Http\Requests\User\UpdateFilesRequest;
use App\Jobs\Moderation\ValidateUserProfileJob;
use App\Jobs\Telegram\SendBotMessageJob;
use App\Models\Moderation\UserModeration;
use App\Models\User\UserFile;
use App\Services\Moderation\ModerationService;
use App\Services\User\UserService;
use AutoMapperPlus\AutoMapper;
use AutoMapperPlus\Exception\InvalidArgumentException;
use AutoMapperPlus\Exception\UnregisteredMappingException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class ModerationController extends Controller
{
    public function __construct(
        private readonly AutoMapper $mapper,
        private readonly UserService $userService,
        private readonly ModerationService $moderationService,
    )
    {

    }

    /**
     * @throws UnregisteredMappingException
     */
    public function getUser(Request $request): JsonResponse
    {
        $userDto = $this->userService->getById((int)$request->input('user_id'));
        if ($userDto === null) {
            return $this->response([], Response::HTTP_NOT_FOUND);
        }

        $userDto->photos = UserFile::query()
            ->whereIn('type', [FileTypeEnum::VERIFICATION_PHOTO, FileTypeEnum::IMAGE])
            ->where('user_id', $request->input('user_id'))
            ->where('deleted_at', null)
            ->get();

        $fileIdsToRemove = $userDto->photos->pluck('file_id')->filter();
        $userDto->photos = $userDto->photos->reject(
            fn($file) => $fileIdsToRemove->contains($file->id)
        )->values();

        return $this->response($userDto);
    }

    public function validateUserProfilePhotos(Request $request): Response|JsonResponse
    {
        $request->validate([
            'user_id' => 'required|numeric|gt:0',
        ]);

        $userDto = $this->userService->getById($request->input('user_id'));
        $this->moderationService->isRequirementsMet($userDto);

        return $this->response($userDto);
    }

    /**
     * todo: this is should be in FileController or UserController
     * @throws InvalidArgumentException
     * @throws ApiException|UnregisteredMappingException
     */
    public function updateFilesWithModeration(UpdateFilesRequest $request): JsonResponse
    {
        if (!empty($request->validated()['files'])) {
            /** @see UserMapping::arrayToSaveFileDto */
            $data = $this->mapper->mapMultiple(
                $request->validated()['files'],
                SaveFileDto::class,
                ['user_id' => Auth::id()]
            );
            $this->userService->updateFiles($data);
        }

        $this->userService->moderationUpdate(Auth::id(), $request->validated());

        // For now we just can make all resolved cuz profile is going to admin again in ValidateUserProfileJob
        UserModeration::query()
            ->where('user_id', Auth::id())
            ->where('is_resolved', false)
            ->update(['is_resolved' => true]);

        $userDto = $this->userService->getById(Auth::id());

        SendBotMessageJob::dispatch($userDto, TelegramMessageEnum::MODERATION_BEGIN_MESSAGE);
        ValidateUserProfileJob::dispatch($userDto)->onQueue('admin-verification');

        return $this->response();
    }

    public function getProfiles(GetModerationProfilesRequest $request): JsonResponse
    {
        return $this->response(
            $this->moderationService->getProfiles($request->validated())
        );
    }

    /**
     * @throws ApiException|UnregisteredMappingException
     */
    public function updateStatus(UpdateModerationStatusRequest $request): Response|JsonResponse
    {
        $this->moderationService->updateStatus($request->validated());
        return $this->response();
    }
}
