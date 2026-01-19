<?php

namespace App\Dto\User;

use App\Dto\BaseDto;

class UserSettingsDto extends BaseDto
{
    public bool $disableNotifications;
    public bool $hideInstagram;
    public bool $hideAge;
}
