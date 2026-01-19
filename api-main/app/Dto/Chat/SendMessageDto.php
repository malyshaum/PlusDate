<?php

namespace App\Dto\Chat;

use App\Dto\BaseDto;

class SendMessageDto extends BaseDto
{
    public int $chatId;
    public int $senderId;
    public string $message;
}