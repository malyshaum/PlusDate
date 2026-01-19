<?php

namespace App\Dto\Chat;

use App\Dto\BaseDto;
use App\Dto\User\UserDto;

class ChatMessageDto extends BaseDto
{
    public int $id;
    public int $chatId;
    public int $senderId;
    public UserDto $sender;
    public string $message;
    public string $sentAt;
    public null|string $readAt;
    public string $createdAt;
    public string $updatedAt;
}
