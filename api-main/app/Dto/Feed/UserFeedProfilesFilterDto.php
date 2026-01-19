<?php

namespace App\Dto\Feed;

use App\Dto\BaseDto;

class UserFeedProfilesFilterDto extends BaseDto
{
    public int $userId;
    public string|null $cursor = null;
    public int $perPage = 10;
    public bool $skipFilter = false;
}
