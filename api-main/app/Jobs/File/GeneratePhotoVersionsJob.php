<?php

namespace App\Jobs\File;

use App\Services\User\FileService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;

class GeneratePhotoVersionsJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 2;

    public function __construct(
        private readonly string $filePath,
        private readonly int $fileId,
    ) {}

    public function handle(ImageManager $imageManager): void
    {
        if (!Storage::exists($this->filePath)) {
            Log::warning("[GeneratePhotoVersions] Original file not found: {$this->filePath} (ID: {$this->fileId})");
            return;
        }

        $originalFileName = basename($this->filePath);

        $this->createVersionIfMissing($imageManager, $originalFileName, FileService::PREFIX_MINI, 128);
        $this->createVersionIfMissing($imageManager, $originalFileName, FileService::PREFIX_MEDIUM, 500);
        $this->createBlurredIfMissing($imageManager, $originalFileName);
    }

    private function createVersionIfMissing(ImageManager $imageManager, string $originalFileName, string $prefix, int $width): void
    {
        $versionPath = Str::replace($originalFileName, $prefix . $originalFileName, $this->filePath);

        if (Storage::exists($versionPath)) {
            return;
        }

        $image = $imageManager
            ->read(Storage::get($this->filePath))
            ->scaleDown(width: $width)
            ->toWebp();

        Storage::put($versionPath, $image);
        Log::info("[GeneratePhotoVersions] Created {$prefix} version for {$this->filePath}");
    }

    private function createBlurredIfMissing(ImageManager $imageManager, string $originalFileName): void
    {
        $blurredPath = Str::replace($originalFileName, FileService::PREFIX_BLURRED . $originalFileName, $this->filePath);

        if (Storage::exists($blurredPath)) {
            return;
        }

        $blurredImage = $imageManager
            ->read(Storage::get($this->filePath))
            ->scaleDown(width: 500)
            ->blur(100)
            ->blur(100)
            ->toWebp();

        Storage::put($blurredPath, $blurredImage);
        Log::info("[GeneratePhotoVersions] Created blurred version for {$this->filePath}");
    }
}
