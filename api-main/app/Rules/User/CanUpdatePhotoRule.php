<?php

namespace App\Rules\User;

use App\Enums\Core\ErrorMessageEnum;
use App\Enums\Core\FileTypeEnum;
use App\Models\User\UserFile;
use App\Rules\BaseRule;

class CanUpdatePhotoRule extends BaseRule
{
    protected string $message = ErrorMessageEnum::VALIDATION_PHOTO_ALREADY_WAS_UPDATED->value;

    public function passes($attribute, $value): bool
    {
        $userFile = UserFile::query()
            ->where('user_id', $this->data['user_id'])
            ->where('id', (int)$value)
            ->first();

        if ($userFile->type === FileTypeEnum::VERIFICATION_PHOTO->value) {
            return false;
        }

        if ($userFile === null || $userFile->is_under_moderation) {
            $this->message = ErrorMessageEnum::VALIDATION_INVALID->value;
            return false;
        }

        $isReplaceAlreadyExists = UserFile::query()
            ->where('user_id', $this->data['user_id'])
            ->where('file_id', (int)$value)
            ->exists();

        return $isReplaceAlreadyExists === false;
    }
}
