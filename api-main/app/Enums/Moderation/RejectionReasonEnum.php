<?php

namespace App\Enums\Moderation;

use App\Enums\BaseEnumTrait;

/**
 * TODO: create SDK to use in admin project same enums
 */
enum RejectionReasonEnum: int
{
    use BaseEnumTrait;

    case BAD_PHOTO_QUALITY = 1;
    case FACE_NOT_DETECTED = 2;
    case VIOLATION_OF_INTERNAL_RULES  = 3;
    case NSFW_CONTENT = 4;
    case GENERAL_REASON = 5;
    case USER_PROFILE_PHOTO_BAD_PHOTO_QUALITY = 6;
    case USER_PROFILE_PHOTO_FACE_NOT_DETECTED = 7;
    case USER_PROFILE_PHOTO_NSFW_CONTENT = 8;
    case FACE_FROM_VERIFICATION_PHOTO_NOT_FOUND = 9;
    case USER_PROFILE_PHOTO_FACE_FROM_VERIFICATION_PHOTO_NOT_FOUND = 10;
    case DECLINED_BY_ADMIN = 11;
    case USER_PROFILE_PHOTO_INTERNAL_ERROR = 12;
    case VIDEO_INAPPROPRIATE = 13;
    case NAME_INAPPROPRIATE = 14;
    case DESCRIPTION_INAPPROPRIATE = 15;
    case INSTAGRAM_INAPPROPRIATE = 16;
    case PROFILE_FULLY_REJECTED = 17;
    case MODERATION_IGNORED = 18;
}
