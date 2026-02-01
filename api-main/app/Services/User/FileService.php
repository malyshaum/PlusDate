<?php

namespace App\Services\User;

use App\Dto\Storage\ReorderFilesDto;
use App\Dto\Storage\SaveFileDto;
use App\Enums\Core\ErrorMessageEnum;
use App\Enums\Core\FileTypeEnum;
use App\Exceptions\ApiException;
use App\Jobs\File\PostProcessPhotoJob;
use App\Models\User\UserFile;
use Exception;
use Illuminate\Http\File;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Imagick\Modifiers\StripMetaModifier;
use Intervention\Image\ImageManager;

readonly class FileService
{
    private const int NULL_ORDER_VALUE = 999999;

    public const string PREFIX_MINI = 'mini_';
    public const string PREFIX_BLURRED = 'blurred_';
    public const string PREFIX_MEDIUM = 'medium_';


    public function __construct(
        private ImageManager $imageManager,
    )
    {

    }

    /**
     * @param UploadedFile[] $files
     * @param int $userId
     * @param FileTypeEnum $fileType
     * @return UserFile[]
     */
    public function save(array $files, int $userId, FileTypeEnum $fileType): array
    {
        if (empty($files)) {
            return [];
        }

        $userFiles = [];
        $nextOrder = $this->getNextOrder($userId);

        foreach ($files as $index => $file) {
            if ($file->isValid()) {
                $storePath = $userId."/".$fileType->value."s";
                $path = Storage::putFile($storePath, $file);

                $userFile = UserFile::query()->create([
                    'user_id' => $userId,
                    'filepath' => $path,
                    'type' => $fileType->value,
                    'order' => $nextOrder + $index,
                ]);

                $userFiles[] = $userFile;
            }
        }

        return $userFiles;
    }

    /**
     * @throws ApiException
     */
    public function savePhoto(SaveFileDto $dto): UserFile|null
    {
        if ($dto->file->isValid() === false) {
            throw new ApiException(ErrorMessageEnum::ERROR_FILE_IS_INVALID);
        }

        DB::beginTransaction();
        try {
            $webpImage = $this->imageManager->read($dto->file)
                ->modify(new StripMetaModifier())
                ->scaleDown(width: 1080)
                ->toWebp();

            $storePath = $dto->userId. "/images/" .Str::uuid()->toString() . '.webp';

            if (!Storage::put($storePath, $webpImage->toString())) {
                throw new ApiException(ErrorMessageEnum::ERROR_WHILE_UPLOADING_FILE);
            }

            PostProcessPhotoJob::dispatchSync($storePath);

            if ($dto->isMain) {
                UserFile::query()
                    ->where('user_id', $dto->userId)
                    ->where('is_main', true)
                    ->update(['is_main' => false]);
            }

            if ($dto->fileType === FileTypeEnum::VERIFICATION_PHOTO) {
                UserFile::query()
                    ->where('user_id', $dto->userId)
                    ->where('type', FileTypeEnum::VERIFICATION_PHOTO)
                    ->delete();
            }

            $order = $dto->order ?? $this->getNextOrder($dto->userId);

            $userFile = UserFile::query()->create([
                'user_id' => $dto->userId,
                'filepath' => $storePath,
                'type' => $dto->fileType->value,
                'file_id' => $dto->fileId,
                'is_under_moderation' => $dto->isUnderModeration,
                'is_main' => $dto->isMain,
                'order' => $order
            ]);

            DB::commit();
            return $userFile;
        }catch (Exception $exception){
            DB::rollBack();
            throw $exception;
        }
    }

    /**
     * @throws ApiException
     * @throws Exception
     */
    public function saveVideo(SaveFileDto $dto): UserFile|null
    {
        if ($dto->file->isValid() === false) {
            throw new ApiException(ErrorMessageEnum::ERROR_FILE_IS_INVALID);
        }

        $storePath = $dto->userId. "/videos";

        if (strtolower($dto->file->getClientOriginalExtension()) === 'mov') {
            $storePath = $this->convertMovToMp4($dto->file, $storePath);
        } else {
            $storePath = Storage::put($storePath, $dto->file);
        }

        $this->createVideoThumbnail($storePath);

        $order = $dto->order ?? $this->getNextOrder($dto->userId);

        return UserFile::query()->create([
            'user_id' => $dto->userId,
            'filepath' => $storePath,
            'type' => $dto->fileType->value,
            'file_id' => $dto->fileId,
            'is_under_moderation' => $dto->isUnderModeration,
            'is_main' => $dto->isMain,
            'order' => $order
        ]);
    }

    /**
     * @throws ApiException
     * @throws Exception
     */
    public function saveFile(SaveFileDto $dto): UserFile
    {
        if ($dto->file->isValid() === false) {
            throw new ApiException(ErrorMessageEnum::ERROR_FILE_IS_INVALID);
        }

        $storePath = $dto->userId."/".$dto->fileType->value."s";

        if ($dto->fileType === FileTypeEnum::VIDEO) {
            if (strtolower($dto->file->getClientOriginalExtension()) === 'mov') {
                $path = $this->convertMovToMp4($dto->file, $storePath);
            } else {
                $path = Storage::putFile($storePath, $dto->file);
            }

            Storage::setVisibility($path, 'public');
            $this->createVideoThumbnail($path);
        }

        if ($dto->fileType === FileTypeEnum::IMAGE || $dto->fileType === FileTypeEnum::VERIFICATION_PHOTO) {

            $webpImage = $this->imageManager->read($dto->file)
                ->modify(new StripMetaModifier())
                ->scaleDown(width: 1080)
                ->toWebp();

            $filename = Str::uuid()->toString() . '.webp';
            $path = $storePath . '/' . $filename;
            Storage::put($path, $webpImage, 'public');

            PostProcessPhotoJob::dispatch($path);
        }

        if ($dto->deleteParent === true && $dto->fileId !== null) {
            $parentFile = UserFile::query()
                ->where('user_id', $dto->userId)
                ->where('id', $dto->fileId)
                ->first();

            Storage::delete($parentFile->filepath);
            $parentFile->delete();
        }

        $order = $dto->order ?? $this->getNextOrder($dto->userId);

        return UserFile::query()->create([
            'user_id' => $dto->userId,
            'filepath' => $path,
            'type' => $dto->fileType->value,
            'file_id' => $dto->fileId,
            'is_under_moderation' => $dto->isUnderModeration,
            'is_main' => $dto->isMain,
            'order' => $order
        ]);
    }

    /**
     * Get next order value for user files
     */
    private function getNextOrder(int $userId): int
    {
        $maxOrder = UserFile::query()
            ->where('user_id', $userId)
            ->whereNotNull('order')
            ->max('order');

        return ($maxOrder ?? -1) + 1;
    }

    /**
     * @throws Exception
     */
    private function convertMovToMp4(UploadedFile $file, string $storePath): string
    {
        $tempMovPath = tempnam(sys_get_temp_dir(), 'video_') . '.mov';
        $file->move(dirname($tempMovPath), basename($tempMovPath));

        $tempMp4Path = tempnam(sys_get_temp_dir(), 'video_') . '.mp4';

        $command = sprintf(
            'ffmpeg -i %s -c copy -movflags +faststart %s 2>&1',
            escapeshellarg($tempMovPath),
            escapeshellarg($tempMp4Path)
        );

        exec($command, $output, $returnCode);

        if ($returnCode !== 0 || !file_exists($tempMp4Path)) {
            unlink($tempMovPath);
            throw new Exception('Failed to convert MOV to MP4: ' . implode("\n", $output));
        }

        $path = Storage::put($storePath, new File($tempMp4Path));

        unlink($tempMovPath);
        unlink($tempMp4Path);

        return $path;
    }

    /**
     * @throws Exception
     */
    private function createVideoThumbnail(string $videoPath): void
    {
        $tempThumbnailPath = tempnam(sys_get_temp_dir(), 'video_thumb_') . '.jpg';

        $command = sprintf(
            'ffmpeg -i %s -ss 00:00:01.000 -vframes 1 -q:v 2 %s 2>&1',
            escapeshellarg(Storage::temporaryUrl($videoPath, Carbon::now()->addDay())),
            escapeshellarg($tempThumbnailPath)
        );

        exec($command, $output, $returnCode);

        if ($returnCode !== 0 || !file_exists($tempThumbnailPath)) {
            throw new Exception('Failed to create video thumbnail: ' . implode("\n", $output));
        }

        $thumbnailImage = $this->imageManager->read($tempThumbnailPath)
            ->modify(new StripMetaModifier())
            ->toWebp(quality: 85);

        $videoFileName = pathinfo($videoPath, PATHINFO_FILENAME);
        $thumbnailFileName = $videoFileName . '.webp';
        $thumbnailDirectory = dirname($videoPath);
        $thumbnailPath = $thumbnailDirectory . '/' . $thumbnailFileName;

        Storage::put($thumbnailPath, $thumbnailImage);

        $this->createBlurredVideoThumbnail($tempThumbnailPath, $thumbnailDirectory, $thumbnailFileName);

        unlink($tempThumbnailPath);
    }

    /**
     * @throws Exception
     */
    private function createBlurredVideoThumbnail(string $thumbnailTempPath, string $videoDirectory, string $thumbnailFileName): void
    {
        $blurredImage = $this->imageManager
            ->read($thumbnailTempPath)
            ->blur(60)
            ->toWebp(quality: 85);

        $blurredFileName = 'blurred_' . $thumbnailFileName;
        $blurredPath = $videoDirectory . '/' . $blurredFileName;

        Storage::put($blurredPath, $blurredImage);
    }

    /**
     * @throws ApiException
     */
    public function delete(int $fileId): void
    {
        try {
            $file = UserFile::query()->find($fileId);

            if (Storage::exists($file->filepath)
                && Storage::delete($file->filepath)
            ) {
                $file->delete();
            }
        } catch (Exception $e) {
            throw new ApiException(ErrorMessageEnum::ERROR_WHILE_DELETING_FILE, 500);
        }
    }

    /**
     * Reorder files for a user
     *
     * @throws ApiException
     * @throws Exception
     */
    public function reorderFiles(ReorderFilesDto $dto): void
    {
        DB::beginTransaction();
        try {
            $fileIds = array_map(fn($item) => $item->fileId, $dto->items);
            $userFiles = UserFile::query()
                ->where('user_id', $dto->userId)
                ->whereIn('id', $fileIds)
                ->get()
                ->keyBy('id');

            if ($userFiles->count() !== count($fileIds)) {
                throw new ApiException(ErrorMessageEnum::VALIDATION_INVALID, 400);
            }

            foreach ($dto->items as $item) {
                $file = $userFiles->get($item->fileId);
                if ($file) {
                    $file->order = $item->order;
                    $file->save();
                }
            }

            $this->reindexOrders($dto->userId);

            DB::commit();
        } catch (Exception $exception) {
            DB::rollBack();
            throw $exception;
        }
    }

    private function reindexOrders(int $userId): void
    {
        $files = UserFile::query()
            ->where('user_id', $userId)
            ->orderByRaw('COALESCE("order", ' . self::NULL_ORDER_VALUE . ')')
            ->orderBy('id')
            ->get();

        foreach ($files as $index => $file) {
            $file->order = $index;
            $file->save();
        }
    }
}
