<?php

declare(strict_types=1);

namespace App\Providers;

use Throwable;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\ServiceProvider;

class ValidNamesServiceProvider extends ServiceProvider
{
    private const int BATCH_SIZE = 1000;
    private const string REDIS_KEY = 'valid_names:dictionary';
    private const string FILE_PATH = 'dictionaries/valid_names.txt';

    public function boot(): void
    {
        if (!config('app.load_valid_names_to_redis', true)) {
            return;
        }

        $this->loadValidNamesToRedis();
    }

    private function loadValidNamesToRedis(): void
    {
        try {
            if (Redis::exists(self::REDIS_KEY)) {
                return;
            }

            $filePath = $this->getFilePath();
            if (!$filePath) {
                return;
            }

            $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

            if (!$lines) {
                return;
            }

            $names = $this->scanNamesFromFiles($lines);

            $this->pushToRedis($names);
        } catch (Throwable) {
            // Redis can be unavailable during CI bootstrap or local setup.
            // The dictionary is an optimization layer, so application boot should not fail here.
            return;
        }
    }

    private function getFilePath(): ?string
    {
        $filePath = storage_path('app/' . self::FILE_PATH);

        return !file_exists($filePath) ? null : $filePath;
    }

    private function pushToRedis(array $names): void
    {
        $batches = array_chunk($names, self::BATCH_SIZE);

        foreach ($batches as $batch) {
            Redis::sadd(self::REDIS_KEY, ...$batch);
        }
    }

    private function scanNamesFromFiles(array $lines): array
    {
        $names = [];

        foreach ($lines as $line) {
            $names[] = mb_strtolower(trim($line));
        }

        return $names;
    }
}
