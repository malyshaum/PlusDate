<?php

namespace App\Dto\Chat;

use App\Dto\BaseDto;

class ChatFilterDto extends BaseDto
{
    public int $userId;
    public string|null $cursor = null;
    public bool|null $hasMessages = null;
}
