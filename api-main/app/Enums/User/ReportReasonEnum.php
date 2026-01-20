<?php

namespace App\Enums\User;

use App\Enums\BaseEnumTrait;

enum ReportReasonEnum: string
{
    use BaseEnumTrait;

    case INAPPROPRIATE_CONTENT = 'inappropriate_content';
    case FAKE_PROFILE = 'fake_profile';
    case SCAM = 'scam';
    case SPAM_OR_ADVERTISEMENT = 'spam_or_advertisement';
    case OTHER = 'other';
}
