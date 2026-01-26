<?php

namespace App\Mapping\User;

use App\Dto\User\OnboardDto;
use App\Dto\User\UserFeedProfileDto;
use App\Dto\User\UserSearchPreferenceDto;
use App\Dto\User\UserSettingsDto;
use App\Enums\Core\GenderEnum;
use App\Enums\Core\SearchForEnum;
use App\Enums\Core\ZodiacSignEnum;
use App\Http\Requests\User\OnboardRequest;
use App\Services\User\NameNormalizationServiceInterface;
use AutoMapperPlus\CustomMapper\CustomMapper;

class OnboardRequestToOnboardDtoMapper extends CustomMapper
{
    /**
     * @param OnboardRequest $source
     * @param OnboardDto $destination
     */
    public function mapToObject($source, $destination): OnboardDto
    {
        $data = $source->validated();

        $destination->userId = $data['user_id'];
        $destination->name = $data['name'];
        $destination->instagram = $data['instagram'] ?? null;
        $destination->profileDescription = $data['profile_description'] ?? null;
        $destination->isOnboarded = true;
        $destination->isUnderModeration = true;
        $destination->languageCode = $data['language_code'] ?? 'en';

        $this->setFeedProfile($data, $destination);
        $this->setSearchPreferences($data, $destination);
        $this->setUserSettings($destination);

        return $destination;
    }

    private function setFeedProfile(array $data, OnboardDto $destination): void
    {
        $destination->feedProfile = new UserFeedProfileDto();
        $destination->feedProfile->cityId = $data['city_id'];

        if (isset($data['activity_ids']) && is_array($data['activity_ids'])) {
            $destination->feedProfile->activityIds = array_filter($data['activity_ids'], fn($id) => $id !== null);
        } elseif (isset($data['activity_id'])) {
            $destination->feedProfile->activityIds = [$data['activity_id']];
            $destination->feedProfile->activityId = $data['activity_id'];
        } else {
            $destination->feedProfile->activityIds = null;
        }

        $destination->feedProfile->hobbies = $data['hobbies'] ?? null;
        $destination->feedProfile->height = $data['height'] ?? null;
        $destination->feedProfile->eyeColor = $data['eye_color'] ?? null;
        $destination->feedProfile->zodiacSign = isset($data['zodiac_sign'])
            ? ZodiacSignEnum::tryFrom($data['zodiac_sign'])
            : null;
        $destination->feedProfile->sex = GenderEnum::from($data['sex']);
        $destination->feedProfile->age = $data['age'];
        $destination->feedProfile->searchFor = SearchForEnum::from($data['search_for']);
    }

    private function setSearchPreferences(array $data, OnboardDto $destination): void
    {
        $destination->searchPreference = new UserSearchPreferenceDto();
        $destination->searchPreference->cityId = $data['city_id'];
        $destination->searchPreference->fromAge = 18;
        $destination->searchPreference->toAge = 60;
        $destination->searchPreference->searchFor = SearchForEnum::from($data['search_for']);

        if (GenderEnum::from($data['sex']) === GenderEnum::MALE) {
            $destination->searchPreference->gender = GenderEnum::FEMALE;
        } else {
            $destination->searchPreference->gender = GenderEnum::MALE;
        }
    }

    private function setUserSettings(OnboardDto $destination): void
    {
        $destination->settings = new UserSettingsDto();
        $destination->settings->hideAge = false;
        $destination->settings->disableNotifications = false;
        $destination->settings->hideInstagram = false;
    }
}
