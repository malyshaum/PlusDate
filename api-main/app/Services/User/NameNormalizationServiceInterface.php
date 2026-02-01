<?php

declare(strict_types=1);

namespace App\Services\User;

interface NameNormalizationServiceInterface
{
    public function normalize(string|null $name): ?string;
}
