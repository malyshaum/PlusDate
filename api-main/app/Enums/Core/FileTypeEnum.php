<?php

namespace App\Enums\Core;

use App\Enums\BaseEnumTrait;

enum FileTypeEnum: string
{
    use BaseEnumTrait;

    case VIDEO = 'video';
    case IMAGE = 'image';
    case VERIFICATION_PHOTO = 'verification_photo';
}
