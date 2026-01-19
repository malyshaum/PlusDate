<?php

namespace App\Dto\User;

use App\Dto\BaseDto;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class UserDto extends BaseDto
{
    public int $id;
    public string|null $name;
    public string|null $username;
    public string|null $photoUrl;
    public string|null $instagram;
    public string|null $languageCode;
    public string|null $profileDescription;
    public bool $isOnboarded;
    public bool $isUnderModeration;
    public bool $isTrialUsed;
    public bool $isPremium;
    public bool $blocked;
    public UserFeedProfileDto|null $feedProfile;

    public Collection|null $photos;
    public Collection|null $videos;
    public Collection|null $files;

    public Carbon|null $deletedAt;
    public Carbon|null $blockedAt;
}
