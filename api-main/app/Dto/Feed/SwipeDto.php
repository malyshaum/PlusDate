<?php

namespace App\Dto\Feed;

use App\Dto\BaseDto;
use App\Enums\Core\SwipeActionEnum;

class SwipeDto extends BaseDto
{
    public int $id;
    public int $userId;
    public int $profileId;
    public SwipeActionEnum $action;
    public bool $isRespond = false;
}
