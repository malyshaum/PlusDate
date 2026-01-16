<?php

namespace App\Clients;

use App\Enums\Core\ErrorMessageEnum;
use App\Exceptions\ApiException;
use Exception;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;

class ImmagaClient
{
    private const FACE_DETECTION_URI = 'faces/detections';
    private const FACE_SIMILARITY_URI = 'faces/similarity';
    private const NSFW_DETECTION_URI = 'categories/adult_content';
    private const UPLOAD_FILE_URI = 'uploads';
    private const BASE_URL = 'https://api.imagga.com/v2';
    private const TIMEOUT = 30;

    public function __construct(
        private readonly string $publicKey,
        private readonly string $privateKey,
        private readonly ImageManager $imageManager,
    ){
        //
    }


    /**
     * @throws ApiException
     * @throws ConnectionException
     */
    public function getUploadId(string $filePath): string
    {
        $jpgImageContent = $this->getImageAsJpg($filePath);

        $response = $this->getClient()
            ->attach('image', $jpgImageContent)
            ->post(self::BASE_URL.'/'.self::UPLOAD_FILE_URI);

        return json_decode($response->body(), true)['result']['upload_id'];
    }

    /**
     * @throws ApiException
     * @throws ConnectionException
     * @throws Exception
     */
    public function getNSFWConfidence(string $filePath): float
    {
        try {
            $jpgImageContent = $this->getImageAsJpg($filePath);

            $response = $this->getClient()
                ->attach('image', $jpgImageContent, 'image.jpg')
                ->post(self::BASE_URL.'/'.self::NSFW_DETECTION_URI);

            $categoriesResult = json_decode($response->body(), true)['result']['categories'];

            Log::debug('NSFW check result: ', $categoriesResult);

            $result = array_filter($categoriesResult, fn($item) => $item['name']['en'] == 'explicit');
            if (!empty($result)) {
                $explicitCategory = array_values($result)[0];
                return (float)$explicitCategory['confidence'];
            }

            return 0;
        } catch (Exception $e) {
            Log::error('Imagga API error', [
                'file_path' => $filePath,
                'error' => $e->getMessage(),
            ]);

            throw new Exception($e->getMessage(), 500);
        }
    }

    /**
     * @throws ConnectionException|ApiException
     */
    public function getFaceConfidence(string $filePath): float
    {
        $uploadId = $this->getUploadId($filePath);

        try {
            $jpgImageContent = $this->getImageAsJpg($filePath);

            $response = $this->getClient()
                ->attach('image', $jpgImageContent, 'image.jpg')
                ->withQueryParameters([
                    'return_face_id' => true,
                    'image_upload_id' => $uploadId,
                ])
                ->post(self::BASE_URL.'/'.self::FACE_DETECTION_URI);

            $facesData = json_decode($response->body(), true)['result'];

            $facesData = $facesData['faces'];

            $highestConfidence = 0;
            foreach ($facesData as $faceData) {
                if ($faceData['confidence'] > $highestConfidence) {
                    $highestConfidence = $faceData['confidence'];
                }
            }


            return $highestConfidence;
        } catch (ConnectionException $e) {
            Log::error('Imagga API error', [
                'file_path' => $filePath,
                'error' => $e->getMessage()
            ]);

            throw $e;
        }
    }

    /**
     * @throws ApiException
     * @throws Exception
     */
    public function getFaceIdFromImage(string $filePath): string|null
    {
        $uploadId = $this->getUploadId($filePath);

        try {
            $jpgImageContent = $this->getImageAsJpg($filePath);

            $response = $this->getClient()
                ->attach('image', $jpgImageContent, 'image.jpg')
                ->withQueryParameters([
                    'return_face_id' => true,
                    'image_upload_id' => $uploadId,
                ])
                ->post(self::BASE_URL.'/'.self::FACE_DETECTION_URI);

            $result = json_decode($response->body(), true)['result'];

            Log::debug('Face ID detection response: ', $result);

            if (empty($result['faces'])) {
                return null;
            }

            return $result['faces'][0]['face_id'] ?? null;
        } catch (Exception $e) {
            Log::error('Imagga API error getting face ID', [
                'file_path' => $filePath,
                'error' => $e->getMessage()
            ]);

            throw new Exception($e->getMessage(), 500);
        }
    }

    /**
     * @throws ApiException
     * @throws Exception
     */
    public function compareFaces(string $sourceFaceId, string $targetFilePath): float
    {
        try {
            $targetFaceId = $this->getFaceIdFromImage($targetFilePath);

            if ($targetFaceId === null) {
                Log::warning('No face detected in image', [
                    'target' => $targetFilePath,
                ]);
                return 0;
            }

            $response = $this->getClient()->get(self::BASE_URL.'/'.self::FACE_SIMILARITY_URI, [
                    'face_id' => $sourceFaceId,
                    'second_face_id' => $targetFaceId,
                ]);

            $result = json_decode($response->body(), true)['result'];
            return (float)($result['score'] ?? 0);
        } catch (Exception $e) {
            Log::error('Imagga API error comparing faces', [
                'source_face_id' => $sourceFaceId,
                'target_file' => $targetFilePath,
                'error' => $e->getMessage()
            ]);

            throw new Exception($e->getMessage(), 500);
        }
    }

    /**
     * @throws ApiException
     */
    private function getImageAsJpg(string $filePath): string
    {
        $fileContent = Storage::get($filePath);
        if (!$fileContent) {
            throw new ApiException(ErrorMessageEnum::ERROR_FILE_IS_MISSING, 404);
        }

        $jpgImage = $this->imageManager->read($fileContent)->toJpeg(quality: 100);
        return $jpgImage->toString();
    }

    private function getClient(): PendingRequest
    {
        return Http::withBasicAuth($this->publicKey, $this->privateKey)
            ->timeout(self::TIMEOUT)
            ->withHeaders([
                'Accept' => 'application/json',
            ])
            ->retry(3, 1000)
            ->throw();
    }
}
