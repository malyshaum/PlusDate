<?php

namespace App\Dto\User;

use App\Dto\BaseDto;
use Illuminate\Support\Carbon;

class UserSwipePhaseDto extends BaseDto
{
    public int $userId;
    public string $currentPhase;
    public int $availableSwipes;
    public int $swipesUsedInPhase;
    public Carbon|null $cooldownEndsAt;
    public bool $isOnCooldown;
    public int $availableSuperLikes;
    public int $superLikesUsed;
}
