<?php

namespace App\Rules\Moderation;

use App\Enums\Core\ErrorMessageEnum;
use App\Enums\Core\FileTypeEnum;
use App\Models\User\UserFile;
use App\Rules\BaseRule;

class CanUpdatePhotoRule extends BaseRule
{
    protected string $message = ErrorMessageEnum::VALIDATION_PHOTO_ALREADY_WAS_UPDATED->value;

    public function passes($attribute, $value): bool
    {
        $fileType = $this->data['file_type'] ?? $value['file_type'] ?? null;
        if (in_array($fileType, [FileTypeEnum::VERIFICATION_PHOTO->value, FileTypeEnum::VIDEO->value])) {
            return true;
        }

        $userFile = UserFile::query()
            ->where('user_id', $this->data['user_id'])
            ->where('id', $value['file_id'])
            ->first();

        if ($userFile === null) {
            $this->message = ErrorMessageEnum::VALIDATION_INVALID->value;
            return false;
        }

        $isReplaceAlreadyExists = UserFile::query()
            ->where('user_id', $this->data['user_id'])
            ->where('file_id', $value['file_id'])
            ->exists();

        return $isReplaceAlreadyExists === false;
    }
}
