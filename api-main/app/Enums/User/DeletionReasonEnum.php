<?php

namespace App\Enums\User;

use App\Enums\BaseEnumTrait;

enum DeletionReasonEnum: string
{
    use BaseEnumTrait;

    // User initiated reasons
    case FOUND_SOMEONE = 'found_someone';
    case APP_PROBLEMS = 'app_problems';
    case TOO_FEW_USERS = 'too_few_users';
    case BAD_INTERFACE = 'bad_interface';
    case BAD_PROFILES = 'bad_profiles';
    case OTHER = 'other';

    // Admin initiated reasons
    case POLICY_VIOLATION = 'policy_violation';
    case INAPPROPRIATE_BEHAVIOR = 'inappropriate_behavior';
    case FAKE_PROFILE = 'fake_profile';
    case SPAM = 'spam';
    case ADMIN_REQUEST = 'admin_request';
    case GENERAL_REASON = 'general_reason';
}
