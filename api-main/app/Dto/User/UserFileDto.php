<?php

namespace App\Dto\User;

use App\Dto\BaseDto;

class UserFileDto extends BaseDto
{
    public int $userId;
    public string $filepath;
    public string $filename;
}
