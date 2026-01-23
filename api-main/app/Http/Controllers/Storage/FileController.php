<?php

namespace App\Http\Controllers\Storage;

use Exception;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Http\JsonResponse;
use AutoMapperPlus\AutoMapper;
use AutoMapperPlus\Exception\UnregisteredMappingException;
use App\Dto\Storage\ReorderFilesDto;
use App\Dto\Storage\SaveFileDto;
use App\Enums\Core\FileTypeEnum;
use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Storage\DeleteFileRequest;
use App\Http\Requests\Storage\ReorderFilesRequest;
use App\Http\Requests\Storage\UploadPhotoRequest;
use App\Http\Requests\User\UploadVideoRequest;
use App\Services\User\FileService;

class FileController extends Controller
{
    public function __construct(
        private readonly FileService $fileService,
        private readonly AutoMapper $autoMapper,
    )
    {
        //
    }

    /**
     * @throws UnregisteredMappingException
     * @throws ApiException
     */
    public function uploadPhoto(UploadPhotoRequest $request): JsonResponse
    {
        /** @see ArrayToSaveFileDtoMapping */
        $saveFileDto = $this->autoMapper->map(
            $request->validated(),
            SaveFileDto::class,
            ['file_type' => FileTypeEnum::IMAGE->value],
        );

        $userFile = $this->fileService->savePhoto($saveFileDto);

        return $this->response($userFile);
    }

    /**
     * @throws UnregisteredMappingException
     * @throws ApiException
     */
    public function uploadVideo(UploadVideoRequest $request): JsonResponse
    {
        /** @see ArrayToSaveFileDtoMapping */
        $saveFileDto = $this->autoMapper->map(
            $request->validated(),
            SaveFileDto::class,
            ['file_type' => FileTypeEnum::VIDEO->value],
        );

        $userFile = $this->fileService->saveVideo($saveFileDto);
        return $this->response($userFile);
    }

    /**
     * @throws ApiException
     */
    public function delete(DeleteFileRequest $request): JsonResponse
    {
        $this->fileService->delete($request->integer('id'));
        return $this->response(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * @throws ApiException
     * @throws Exception
     * @throws UnregisteredMappingException
     */
    public function reorderFiles(ReorderFilesRequest $request): JsonResponse
    {
        /** @see ArrayToReorderFilesDtoMapper */
        /** @var ReorderFilesDto $dto */
        $dto = $this->autoMapper->map($request->validated(), ReorderFilesDto::class);

        $this->fileService->reorderFiles($dto);

        return $this->response(null, Response::HTTP_NO_CONTENT);
    }
}
