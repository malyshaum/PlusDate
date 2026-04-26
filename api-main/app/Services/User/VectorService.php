<?php

namespace App\Services\User;

use App\Dto\User\UserFeedProfileDto;
use App\Enums\Core\EyeColorEnum;
use App\Enums\Core\GenderEnum;
use App\Models\User\UserFeedProfile;
use Clickbar\Magellan\Data\Geometries\Point;

class VectorService
{
    private const WEIGHTS = [
        'search_for' => 3,
        'latitude' => 2,
        'longitude' => 2,
        'activity_id' => 2,
        'height' => 1,
        'age' => 1,
        'sex' => 1
    ];

    public function createFromDto(UserFeedProfileDto $feedProfileDto): array
    {
        $sex = $feedProfileDto->sex === GenderEnum::MALE ? 1 : 2;
        $coordinates = $this->normalizeCoordinates($feedProfileDto->coordinates);

        $activityId = $feedProfileDto?->activityId;
        if ($activityId === null && !empty($feedProfileDto->activityIds)) {
            $activityId = $feedProfileDto->activityIds[0];
        }

        return [
            $feedProfileDto->searchFor->value * self::WEIGHTS['search_for'],
            $feedProfileDto->age * self::WEIGHTS['age'],
            $sex * self::WEIGHTS['sex'],
            $coordinates['latitude'] * self::WEIGHTS['latitude'],
            $coordinates['longitude'] * self::WEIGHTS['longitude'],
            ($activityId ?? 0) * self::WEIGHTS['activity_id'],
            ($feedProfileDto->height ?? 0) * self::WEIGHTS['height'],
            0,
        ];
    }

    // TODO: use UserFeedProfileDto/s
    public function getSimilarityScore(int $firstProfileId, int $secondProfileId): float
    {
        $firstProfile = UserFeedProfile::query()->findOrFail($firstProfileId);
        $secondProfile = UserFeedProfile::query()->findOrFail($secondProfileId);

        if ($firstProfile->vector === null || $secondProfile->vector === null) {
            return 0;
        }

        return $this->cosineSimilarity($firstProfile->vector, $secondProfile->vector);
    }


    private function cosineSimilarity(array $vector1, array $vector2): float
    {
        $dotProduct = 0;
        $magnitude1 = 0;
        $magnitude2 = 0;

        for ($i = 0; $i < count($vector1); $i++) {
            $dotProduct += $vector1[$i] * $vector2[$i];
            $magnitude1 += $vector1[$i] ** 2;
            $magnitude2 += $vector2[$i] ** 2;
        }

        $magnitude1 = sqrt($magnitude1);
        $magnitude2 = sqrt($magnitude2);

        if ($magnitude1 == 0 || $magnitude2 == 0) {
            return 0;
        }

        return $dotProduct / ($magnitude1 * $magnitude2);
    }

    private function normalizeCoordinates(Point|array|null $coordinates): array
    {
        if ($coordinates instanceof Point) {
            return [
                'latitude' => $coordinates->getLatitude(),
                'longitude' => $coordinates->getLongitude(),
            ];
        }

        return [
            'latitude' => (float)($coordinates['latitude'] ?? 0),
            'longitude' => (float)($coordinates['longitude'] ?? 0),
        ];
    }
}
