<?php

namespace App\Dto\User;

use App\Dto\BaseDto;

class UpdatePhotosDto extends BaseDto
{
    public int $userId;
    public array $photos;
}
