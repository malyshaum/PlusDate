<?php

namespace App\Dto\Moderation;

use App\Dto\BaseDto;
use App\Enums\Moderation\RejectionReasonEnum;

class ModerationResultDto extends BaseDto
{
    public bool $failed;
    public RejectionReasonEnum|null $rejectionReason;
    public int|null $userFileId;
}
