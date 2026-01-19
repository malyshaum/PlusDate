<?php

namespace App\Dto\Chat;

use App\Dto\BaseDto;
use Illuminate\Support\Collection;

class ChatDto extends BaseDto
{
    public int $id;
    public array $users;
    public null|ChatMessageDto $latestMessage;
    public string $createdAt;
    public string $updatedAt;
    public bool $isViewed = false;
}
