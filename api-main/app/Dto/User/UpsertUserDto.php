<?php

namespace App\Dto\User;

use App\Dto\BaseDto;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;

class UpsertUserDto extends BaseDto
{
    public int $id;
    public string $name;
    public string|null $username;
    public string|null $languageCode;
    public string|null $photoUrl;
    public bool $isOnboarded;
    public bool $isUnderModeration;
    public bool $telegramPremium;
    public string|null $instagram;
    public string|null $profileDescription;

    /** @var UploadedFile[]|null */
    public array|null $photos;

    /** @var UploadedFile[]|null */
    public array|null $videos;
    public UploadedFile|null $verificationPhoto;

    public UserFeedProfileDto|null $feedProfile;
    public UserSearchPreferenceDto|null $searchPreference;
    public UserSettingsDto|null $settings;
    public string|null $startParam;
    public bool $isTrialUsed = false;
    public bool|null $botBlocked = null;
    public Carbon|null $botBlockedAt = null;
}
