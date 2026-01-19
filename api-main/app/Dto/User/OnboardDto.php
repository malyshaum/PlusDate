<?php

namespace App\Dto\User;

use App\Dto\BaseDto;

class OnboardDto extends BaseDto
{
    public int $userId;
    public string $name;
    public string|null $instagram;
    public string|null $profileDescription;
    public bool $isOnboarded;
    public bool $isUnderModeration;
    public string $languageCode;

    public UserFeedProfileDto|null $feedProfile;
    public UserSearchPreferenceDto|null $searchPreference;
    public UserSettingsDto|null $settings;
}
