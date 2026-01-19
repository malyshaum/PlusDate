<?php

namespace App\Dto\Chat;

use App\Dto\BaseDto;

class CreateChatDto extends BaseDto
{
    public int $userId;
    public int $otherUserId;
}