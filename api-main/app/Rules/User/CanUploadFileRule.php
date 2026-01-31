<?php

namespace App\Rules\User;

use App\Enums\Core\ErrorMessageEnum;
use App\Enums\Core\FileTypeEnum;
use App\Models\User\UserFile;
use App\Rules\BaseRule;

class CanUploadFileRule extends BaseRule
{
    /**
     * @param $attribute
     * @param $value
     * @return bool
     */
    public function passes($attribute, $value): bool
    {
        $fileType = FileTypeEnum::tryFrom($this->data['file_type']);

        if ($fileType === FileTypeEnum::VIDEO) {
            $userVideo = UserFile::query()
                ->where('user_id', $this->data['user_id'])
                ->where('type', FileTypeEnum::VIDEO)
                ->latest()
                ->first();

            if (isset($this->data['file_id'])) {
                $parentFileExists = UserFile::query()
                    ->where('id', $this->data['file_id'])
                    ->where('user_id', $this->data['user_id'])
                    ->where('type', FileTypeEnum::VIDEO)
                    ->exists();

                if ($parentFileExists === false) {
                    $this->message = ErrorMessageEnum::VALIDATION_PARENT_VIDEO_NOT_EXISTS->value;

                    return false;
                }
            }

            if ($userVideo === null) {
                return true;
            }

            if (empty($this->data['file_id']) || $userVideo->id !== (int)$this->data['file_id']) {
                $this->message = ErrorMessageEnum::VALIDATION_VIDEO_ALREADY_EXISTS->value;

                return false;
            }
        }

        if ($fileType === FileTypeEnum::IMAGE) {
            if (isset($this->data['file_id'])){
                $userImage = UserFile::query()
                    ->where('user_id', $this->data['user_id'])
                    ->where('type', FileTypeEnum::IMAGE)
                    ->where('id', $this->data['file_id'])
                    ->exists();

                if ($userImage === false){
                    return false;
                }
            }
        }

        return true;
    }
}
