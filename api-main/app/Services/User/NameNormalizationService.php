<?php

declare(strict_types=1);

namespace App\Services\User;

use Illuminate\Support\Facades\Redis;

readonly class NameNormalizationService implements NameNormalizationServiceInterface
{
    private const string REDIS_KEY = 'valid_names:dictionary';

    public function normalize(string|null $name): ?string
    {
        if ($name === null || $name === '') {
            return null;
        }

        $name = trim($name);

        if ($result = $this->findInDictionary($name)) {
            return $result;
        }

        if ($result = $this->findInDictionaryVariants($name)) {
            return $result;
        }

        return null;
    }

    private function findInDictionary(string $word): ?string
    {
        if ($this->doesExistInRedis($word)) {
            return mb_convert_case($word, MB_CASE_TITLE, 'UTF-8');
        }

        return null;
    }

    private function findInDictionaryVariants(string $word): ?string
    {
        $variants = $this->generateVariantsWithoutRepeats($word);

        foreach ($variants as $variant) {
            if ($normalizedName = $this->findInDictionary($variant)) {
                return $normalizedName;
            }
        }

        return null;
    }

    private function generateVariantsWithoutRepeats(string $word): array
    {
        $variants = [];

        $variantWithDouble = preg_replace('/(.)\1{2,}/u', '$1$1', $word);

        if ($variantWithDouble !== $word) {
            $variants[] = $variantWithDouble;
        }

        $variantSingle = preg_replace('/(.)\1+/u', '$1', $word);

        if (
            $variantSingle !== $word &&
            $variantSingle !== $variantWithDouble
        ) {
            $variants[] = $variantSingle;
        }

        return $variants;
    }

    private function doesExistInRedis(string $word): bool
    {
        return Redis::sismember(self::REDIS_KEY, mb_strtolower($word));
    }
}
