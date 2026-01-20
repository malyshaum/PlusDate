<?php

namespace App\Enums\User;

use App\Enums\BaseEnumTrait;

enum ReportStatusEnum: string
{
    use BaseEnumTrait;

    case NEW = 'new';
    case REVIEWED = 'reviewed';
    case RESOLVED = 'resolved';
}
