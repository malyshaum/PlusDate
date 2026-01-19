<?php

namespace App\Dto\Feed;

use App\Dto\BaseDto;
use App\Dto\Chat\ChatDto;
use App\Dto\User\UserDto;
use Illuminate\Support\Collection;

class SwipeResultDto extends BaseDto
{
    public int $swipeId;
    public bool $matched;
    public UserDto|null $user = null;
    public ChatDto|null $chat = null;
}
