<?php

namespace App\Http\Controllers\Admin;

use App\Dto\Storage\SaveFileDto;
use App\Enums\Core\FileTypeEnum;
use App\Enums\User\UserStatusEnum;
use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CreateProfileRequest;
use App\Http\Requests\Admin\DeleteAccountRequest;
use App\Http\Requests\Admin\ManagePremiumRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Requests\Admin\UpdateUserStatusRequest;
use App\Http\Requests\Admin\UserIdRequest;
use App\Models\Dictionary\City;
use App\Models\User;
use App\Models\User\UserFeedProfile;
use App\Services\Admin\AdminService;
use App\Services\Admin\PremiumManagementServiceInterface;
use App\Services\User\FileService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Throwable;

class AdminController extends Controller
{
    public function __construct(
        private readonly FileService $fileService,
        private readonly AdminService $adminService,
        private readonly PremiumManagementServiceInterface $premiumManagementService
    )
    {

    }

    /**
     * @throws ApiException
     */
    public function createProfile(CreateProfileRequest $request): void
    {
        $data = $request->validated();

        DB::beginTransaction();
        try {
            $user = User::query()->create([
                'name' => $data['name'],
                'username' => 'plusdate_internal_bot',
                'is_onboarded' => true,
                'is_under_moderation' => false,
                'is_premium' => $data['is_premium'],
                'language_code' => 'ru',
                'instagram' => '',
                'profile_description' => $data['profile_description'],
            ]);

            /** @var City $city */
            $city = City::query()->findOrFail($data['city_id']);

            UserFeedProfile::query()->create([
                'user_id' => $user->id,
                'city_id' => $data['city_id'],
                'sex' => $data['sex'],
                'age' => $data['age'],
                'search_for' => $data['search_for'],
                'coordinates' => $city->location,
                'activity_id' => $data['activity_id'],
                'height' => $data['height'],
                'eye_color' => $data['eye_color'],
                'hobbies' => $data['hobbies'],
            ]);

            /** @var UploadedFile $video */
            if ($video = $request->file('video')) {
                $saveDto = new SaveFileDto();
                $saveDto->file = $video;
                $saveDto->userId = $user->id;
                $saveDto->fileType = FileTypeEnum::VIDEO;

                $this->fileService->saveVideo($saveDto);
            }

            /** @var UploadedFile $photo */
            foreach ($request->file('photos') as $index => $photo) {
                $isMain = false;
                if ($index === 0) {
                    $isMain = true;
                }

                $saveDto = new SaveFileDto();
                $saveDto->file = $photo;
                $saveDto->userId = $user->id;
                $saveDto->fileType = FileTypeEnum::IMAGE;
                $saveDto->isMain = $isMain;

                $this->fileService->savePhoto($saveDto);
            }

            DB::commit();
        } catch (Exception $exception) {
            DB::rollBack();
            throw $exception;
        }
    }

    /**
     * @throws Exception
     */
    public function deleteAccount(DeleteAccountRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['admin_user_id'] = Auth::id();

        $this->adminService->permanentlyDeleteAccount($data);

        return $this->response(null, Response::HTTP_NO_CONTENT);
    }

    public function handleGrantPremium(ManagePremiumRequest $request): JsonResponse
    {
        $this->premiumManagementService->grantPremium(
            $request->getUserId(),
            $request->getPeriod()
        );

        return $this->response([]);
    }

    public function handleRevokePremium(UserIdRequest $request): JsonResponse
    {
        $this->premiumManagementService->revokePremium($request->getUserId());

        return $this->response([]);
    }

    /**
     * @throws Throwable
     */
    public function updateUser(UpdateUserRequest $request): JsonResponse
    {
        $this->adminService->updateUser($request->validated());
        return $this->response();
    }

    public function updateUserStatus(UpdateUserStatusRequest $request): JsonResponse
    {
        $status = $request->getStatus();
        $userId = $request->getUserId();

        $this->adminService->updateUserBlockedStatus(
            $userId,
            $status === UserStatusEnum::BLOCKED
        );

        return $this->response([]);
    }
}
