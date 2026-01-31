<?php

namespace App\Rules\Storage;

use App\Enums\Core\ErrorMessageEnum;
use App\Models\User\UserFile;
use App\Rules\BaseRule;

class CanReorderFilesRule extends BaseRule
{
    public function passes($attribute, $value): bool
    {
        if (!is_array($value) || empty($value)) {
            return false;
        }

        $userId = $this->data['user_id'] ?? null;
        if ($userId === null) {
            return false;
        }

        $fileIds = array_column($value, 'file_id');
        if (empty($fileIds)) {
            return false;
        }

        $userFilesCount = UserFile::query()
            ->where('user_id', $userId)
            ->whereIn('id', $fileIds)
            ->count();

        if ($userFilesCount !== count($fileIds)) {
            $this->message = ErrorMessageEnum::VALIDATION_INVALID->value;
            return false;
        }

        return true;
    }
}
