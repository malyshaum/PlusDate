<?php

namespace App\Services\User;

use App\Models\SwipeLimitConfig;
use Illuminate\Support\Facades\Cache;

readonly class SwipeLimitConfigService
{
    private const int CACHE_TTL = 3600; // 1 hour

    public function getConfig(string $key, int $default = 0): int
    {
        return Cache::remember(
            "swipe_limits:config:{$key}",
            self::CACHE_TTL,
            fn() => SwipeLimitConfig::query()
                ->where('config_key', $key)
                ->value('config_value') ?? $default
        );
    }

    public function getAllConfigs(): array
    {
        return Cache::remember(
            'swipe_limits:config:all',
            self::CACHE_TTL,
            fn() => SwipeLimitConfig::query()
                ->pluck('config_value', 'config_key')
                ->toArray()
        );
    }

    public function updateConfig(string $key, int $value): bool
    {
        $config = SwipeLimitConfig::query()->where('config_key', $key)->first();

        if (!$config) {
            return false;
        }

        $config->update(['config_value' => $value]);

        $this->clearCache($key);

        return true;
    }

    public function clearCache(?string $key = null): void
    {
        if ($key) {
            Cache::forget("swipe_limits:config:{$key}");
        }

        Cache::forget('swipe_limits:config:all');
    }
}
