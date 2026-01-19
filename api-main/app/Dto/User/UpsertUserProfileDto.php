<?php

namespace App\Dto\User;

use App\Dto\BaseDto;
use App\Models\User\UserFile;

class UpsertUserProfileDto extends BaseDto
{
    public int $userId;
    public string|null $instagram;
    public string|null $profileDescription;

    /** @var UserFile[]|null */
    public array|null $photos;

    /** @var UserFile[]|null */
    public array|null $videos;

    public UserFeedProfileDto|null $feedProfileDto;
}
