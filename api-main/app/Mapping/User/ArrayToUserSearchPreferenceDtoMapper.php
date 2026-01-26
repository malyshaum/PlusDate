<?php

namespace App\Mapping\User;

use App\Dto\User\UserSearchPreferenceDto;
use App\Enums\Core\GenderEnum;
use App\Enums\Core\SearchForEnum;
use App\Enums\Core\EyeColorEnum;
use App\Services\Dictionary\DictionaryService;
use App\Services\User\UserService;
use AutoMapperPlus\CustomMapper\CustomMapper;
use AutoMapperPlus\Exception\UnregisteredMappingException;

class ArrayToUserSearchPreferenceDtoMapper extends CustomMapper
{
    public function __construct(
        private readonly UserService $userService,
        private readonly DictionaryService $dictionaryService,
    ) {
    }

    /**
     * @param array $source
     * @param UserSearchPreferenceDto $destination
     * @throws UnregisteredMappingException
     */
    public function mapToObject($source, $destination): UserSearchPreferenceDto
    {
        $preference = $this->userService->getSearchPreferenceDto($source['user_id']);
        if ($preference === null) {
            $destination = new UserSearchPreferenceDto();
        }

        if (isset($source['id'])) {
            $destination->id = $source['id'];
        }

        if (isset($source['user_id'])) {
            $destination->userId = $source['user_id'];
        }

        if (isset($source['city_id'])) {
            $destination->cityId = $source['city_id'];
        }

        if (isset($source['include_nearby'])) {
            $destination->includeNearby = $source['include_nearby'];
        }

        if (isset($source['from_age'])) {
            $destination->fromAge = $source['from_age'];
        }

        if (isset($source['to_age'])) {
            $destination->toAge = $source['to_age'];
        }

        if (isset($source['expand_age_range'])) {
            $destination->expandAgeRange = $source['expand_age_range'];
        }

        if (isset($source['gender'])) {
            $destination->gender = GenderEnum::tryFrom($source['gender']);
        }

        if (isset($source['search_for'])) {
            $destination->searchFor = SearchForEnum::tryFrom($source['search_for']);
        }

        if (array_key_exists('eye_color', $source)) {
            $destination->eyeColor = [];

            if (empty($source['eye_color'])) {
                $source['eye_color'] = [];
            }

            foreach ($source['eye_color'] as $eyeColor) {
                $destination->eyeColor[] = EyeColorEnum::tryFrom($eyeColor)->value;
            }
        }

        if (isset($destination->cityId)) {
            $destination->city = $this->dictionaryService->getCityById($destination->cityId);
            $destination->country = $this->dictionaryService->getCountryByCode($destination->city->countryCode);
        }

        if (array_key_exists('hobbies', $source)) {
            $destination->hobbies = $source['hobbies'];
        }

        if (array_key_exists('height_from', $source)) {
            $destination->heightFrom = $source['height_from'];
        }

        if (array_key_exists('height_to', $source)) {
            $destination->heightTo = $source['height_to'];
        }

        if (array_key_exists('activity_ids', $source)) {
            if (is_array($source['activity_ids']) && !empty($source['activity_ids'])) {
                $destination->activityIds = array_filter($source['activity_ids'], fn($id) => $id !== null);
                if (!empty($destination->activityIds)) {
                    $destination->activityId = $destination->activityIds[0];
                }
            } else {
                $destination->activityIds = [];
                $destination->activityId = null;
            }
        } elseif (array_key_exists('activity_id', $source)) {
            $destination->activityIds = [$source['activity_id']];
            $destination->activityId = $source['activity_id'];
        }

        if (isset($source['with_video'])) {
            $destination->withVideo = $source['with_video'];
        }

        if (isset($source['with_premium'])) {
            $destination->withPremium = $source['with_premium'];
        }

        if (isset($destination->activityId)) {
            $destination->activity = $this->dictionaryService->getActivityById($destination->activityId);
        }

        return $destination;
    }
}
