<?php

namespace App\Services\Moderation;

use App\Clients\ImmagaClient;
use App\Dto\User\UserDto;
use App\Enums\Core\ErrorMessageEnum;
use App\Enums\Core\FileTypeEnum;
use App\Enums\Moderation\RejectionReasonEnum;
use App\Enums\Telegram\TelegramMessageEnum;
use App\Events\Moderation\ModerationStatusUpdatedEvent;
use App\Exceptions\ApiException;
use App\Jobs\Telegram\SendBotMessageJob;
use App\Models\Moderation\UserModeration;
use App\Models\User;
use App\Models\User\UserFile;
use App\Repositories\UserRepository;
use AutoMapperPlus\Exception\UnregisteredMappingException;
use Exception;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Log;

class ModerationService
{
    private const int MINIMUM_ACCEPTED_CONFIDENCE_LEVEL = 60;
    private const int MINIMUM_ACCEPTED_FACE_SIMILARITY_LEVEL = 50;

    public function __construct(
        private readonly ImmagaClient $immagaClient,
        private readonly UserRepository $userRepository,
    )
    {

    }

    /**
     * @throws ApiException
     * @throws Exception
     */
    public function isRequirementsMet(UserDto $userDto): bool
    {
        $userPhotos = UserFile::query()
            ->where('user_id', $userDto->id)
            ->whereIn('type', [FileTypeEnum::IMAGE,FileTypeEnum::VERIFICATION_PHOTO])
            ->orderBy('created_at', 'desc')
            ->limit(4)
            ->get();

        /** @var UserFile $verificationPhoto */
        $verificationPhoto = $userPhotos->where('type', FileTypeEnum::VERIFICATION_PHOTO)->first();
        if ($verificationPhoto === null) {
            throw new ApiException(ErrorMessageEnum::ERROR_NO_VERIFICATION_PHOTO);
        }

        $faceId = $this->immagaClient->getFaceIdFromImage($verificationPhoto->filepath);

        if ($faceId === null) {
            UserModeration::query()->create([
                'user_id' => $userDto->id,
                'rejection_reason' => RejectionReasonEnum::FACE_FROM_VERIFICATION_PHOTO_NOT_FOUND,
                'is_resolved' => false,
                'user_file_id' => $verificationPhoto->id,
            ]);

            ModerationStatusUpdatedEvent::broadcast($userDto, RejectionReasonEnum::FACE_FROM_VERIFICATION_PHOTO_NOT_FOUND);
            return false;
        }


        /** @var UserFile $photo */
        foreach ($userPhotos as $photo) {

            $confidence = $this->immagaClient->compareFaces($faceId, $photo->filepath);

            if ($confidence < self::MINIMUM_ACCEPTED_FACE_SIMILARITY_LEVEL) {
                Log::debug('[ModerationService] face from verification photo not found: ', [
                    'filepath' => $photo->filepath
                ]);

                UserModeration::query()->create([
                    'user_id' => $userDto->id,
                    'rejection_reason' => RejectionReasonEnum::FACE_FROM_VERIFICATION_PHOTO_NOT_FOUND,
                    'is_resolved' => false,
                    'user_file_id' => $photo->id,
                ]);

                ModerationStatusUpdatedEvent::broadcast($userDto, RejectionReasonEnum::FACE_FROM_VERIFICATION_PHOTO_NOT_FOUND);
                return false;
            }

            $confidence = $this->immagaClient->getNSFWConfidence($photo->filepath);
            if ($confidence > self::MINIMUM_ACCEPTED_CONFIDENCE_LEVEL) {
                Log::debug('[ModerationService] detected NSFW: ', ['filepath' => $photo->filepath]);

                UserModeration::query()->create([
                    'user_id' => $userDto->id,
                    'rejection_reason' => RejectionReasonEnum::NSFW_CONTENT,
                    'is_resolved' => false,
                    'user_file_id' => $photo->id,
                ]);

                ModerationStatusUpdatedEvent::broadcast($userDto, RejectionReasonEnum::NSFW_CONTENT);
                return false;
            }
        }

        ModerationStatusUpdatedEvent::broadcast($userDto, null);
        return true;
    }

    // TODO: replace with dto
    public function checkPhoto(UserFile $userFile): UserModeration|null
    {
        $verificationPhoto = UserFile::query()
            ->where('user_id', $userFile->user_id)
            ->where('type', FileTypeEnum::VERIFICATION_PHOTO)
            ->first();

        try {
            $nsfwConf = $this->immagaClient->getNSFWConfidence($userFile->filepath);
            if ($nsfwConf > self::MINIMUM_ACCEPTED_CONFIDENCE_LEVEL) {
                Log::debug('[ModerationService] detected NSFW: ', [
                    'filepath' => $userFile->filepath
                ]);

                return UserModeration::query()->create([
                    'user_id' => $userFile->user_id,
                    'rejection_reason' => RejectionReasonEnum::USER_PROFILE_PHOTO_NSFW_CONTENT,
                    'is_resolved' => false,
                    'user_file_id' => $userFile->id,
                ]);
            }

            $faceConf = $this->immagaClient->getFaceConfidence($userFile->filepath);
            if ($faceConf < self::MINIMUM_ACCEPTED_CONFIDENCE_LEVEL) {
                Log::debug('[ModerationService] face not detected: ', [
                    'filepath' => $userFile->filepath
                ]);

                return UserModeration::query()->create([
                    'user_id' => $userFile->user_id,
                    'rejection_reason' => RejectionReasonEnum::USER_PROFILE_PHOTO_FACE_NOT_DETECTED,
                    'is_resolved' => false,
                    'user_file_id' => $userFile->id,
                ]);
            }

            $faceId = $this->immagaClient->getFaceIdFromImage($verificationPhoto->filepath);
            if ($faceId === null) {
                return UserModeration::query()->create([
                    'user_id' => $userFile->user_id,
                    'rejection_reason' => RejectionReasonEnum::USER_PROFILE_PHOTO_FACE_FROM_VERIFICATION_PHOTO_NOT_FOUND,
                    'is_resolved' => false,
                    'user_file_id' => $userFile->id,
                ]);
            }

            $compareConf = $this->immagaClient->compareFaces($faceId, $userFile->filepath);

            if ($compareConf < self::MINIMUM_ACCEPTED_FACE_SIMILARITY_LEVEL) {
                Log::debug('[ModerationService] face from verification photo not detected: ', [
                    'filepath' => $userFile->filepath
                ]);

                return UserModeration::query()->create([
                    'user_id' => $userFile->user_id,
                    'rejection_reason' => RejectionReasonEnum::USER_PROFILE_PHOTO_FACE_FROM_VERIFICATION_PHOTO_NOT_FOUND,
                    'is_resolved' => false,
                    'user_file_id' => $userFile->id,
                ]);
            }
        } catch (Exception $e) {
            Log::error($e->getMessage());

            return UserModeration::query()->create([
                'user_id' => $userFile->user_id,
                'rejection_reason' => RejectionReasonEnum::USER_PROFILE_PHOTO_INTERNAL_ERROR,
                'is_resolved' => false,
                'user_file_id' => $userFile->id,
            ]);
        }

        return null;
    }

    // Todo: replace array with FilterDto
    public function getProfiles(array $data): LengthAwarePaginator
    {
        return User::query()
            ->where('is_under_moderation', true)
            ->orderBy('created_at', 'desc')
            ->paginate(perPage: $data['per_page'] ?? 25, page: $data['page'] ?? 1);
    }

    // TODO: use DTO instead of array

    /**
     * @throws UnregisteredMappingException
     * @throws ApiException
     */
    public function updateStatus(array $data): void
    {
        $declineReasonEnum = null;
        $telegramMessageEnum = TelegramMessageEnum::MODERATION_SUCCESS_MESSAGE;

        DB::beginTransaction();
        try {
            $userDto = $this->userRepository->getById($data['user_id'], true);
            if ($userDto === null) {
                throw new ApiException(ErrorMessageEnum::ACCOUNT_NOT_FOUND, 404);
            }

            if ($data['accepted'] === false) {
                $rejectionReasons = $data['rejection_reasons'] ?? [];

                foreach ($rejectionReasons as $rejectionReason) {
                    $reasonEnum = RejectionReasonEnum::tryFrom($rejectionReason['reason']);
                    $note = Lang::get(strtolower($reasonEnum->name), locale: $userDto->languageCode);

                    UserModeration::query()->create([
                        'user_id' => $userDto->id,
                        'rejection_reason' => $reasonEnum->value,
                        'is_resolved' => false,
                        'user_file_id' => $rejectionReason['file_id'] ?? null,
                        'note' => $rejectionReason['note'] ?? $note,
                    ]);
                }

                $declineReasonEnum = RejectionReasonEnum::DECLINED_BY_ADMIN;
                $telegramMessageEnum = TelegramMessageEnum::MODERATION_FAILED_MESSAGE;
            } else {
                UserModeration::query()
                    ->where('user_id', $userDto->id)
                    ->where('is_resolved', false)
                    ->update(['is_resolved' => true]);

                User::query()
                    ->withTrashed()
                    ->find($userDto->id)
                    ->update(['is_under_moderation' => false]);

                UserFile::query()
                    ->where('user_id', $userDto->id)
                    ->where('is_under_moderation', true)
                    ->update(['is_under_moderation' => false]);
            }
            DB::commit();
        } catch (Exception $exception) {
            DB::rollBack();
            Log::error($exception->getMessage());
            throw $exception;
        }

        if ($userDto->deletedAt === null) {
            ModerationStatusUpdatedEvent::broadcast($userDto, $declineReasonEnum);
            SendBotMessageJob::dispatch($userDto, $telegramMessageEnum);
        }
    }
}
