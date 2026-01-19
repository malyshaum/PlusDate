<?php

namespace App\Dto\User;

use App\Dto\BaseDto;

class UserDeletionSnapshotDto extends BaseDto
{
    public int $userId;
    public array $userProfile;
    public array $fullProfile;
    public array $statistics;
}
