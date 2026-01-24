<?php

namespace App\Jobs\File;

use App\Services\User\FileService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;

class PostProcessPhotoJob implements ShouldQueue
{
    use Queueable;

    private readonly ImageManager $imageManager;

    /**
     * Create a new job instance.
     */
    public function __construct(
        private readonly string $filePath
    )
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(
        ImageManager $imageManager
    ): void
    {
        $this->imageManager = $imageManager;
        $this->createSmallVersion();
        $this->createMediumVersion();
        $this->createBlurredVersion();
    }

    private function createBlurredVersion(): void
    {
        Log::info('[PostProcessPhotoJob] starting job for '.$this->filePath);
        $blurredImage = $this->imageManager
            ->read(Storage::get($this->filePath))
            ->scaleDown(
                width: 500,
            )
            ->blur(100)
            ->blur(100)
            ->toWebp();

        $originalFileName = basename($this->filePath);
        $blurredFileName = FileService::PREFIX_BLURRED . $originalFileName;

        $blurredPath = Str::replace($originalFileName, $blurredFileName, $this->filePath);

        Storage::put($blurredPath, $blurredImage);
        Log::info('[PostProcessPhotoJob] finished for '.$this->filePath);
    }

    private function createMediumVersion(): void
    {
        Log::info('[PostProcessPhotoJob] starting medium version job for '.$this->filePath);
        $this->scale(FileService::PREFIX_MEDIUM, 500);
    }


    private function createSmallVersion(): void
    {
        Log::info('[PostProcessPhotoJob] starting mini version job for '.$this->filePath);
        $this->scale(FileService::PREFIX_MINI, 128);
    }

    /**
     * @param string $type
     * @param int $width
     * @return void
     */
    private function scale(string $type, int $width): void
    {
        $miniThumbnail = $this->imageManager
            ->read(Storage::get($this->filePath))
            ->scaleDown(
                width: $width,
            )
            ->toWebp();

        $originalFileName = basename($this->filePath);
        $filename = $type . $originalFileName;

        $path = Str::replace($originalFileName, $filename, $this->filePath);

        Storage::put($path, $miniThumbnail);
        Log::info('[PostProcessPhotoJob] ended fro '.$type.' version job for ' . $this->filePath);
    }
}
