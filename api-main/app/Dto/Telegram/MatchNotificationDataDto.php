<?php

namespace App\Dto\Telegram;

use App\Dto\BaseDto;

class MatchNotificationDataDto extends BaseDto
{
    public int|null $chatId = null;
    public int|null $otherUserId = null;
}
