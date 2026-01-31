<?php

namespace App\Rules\User;

use App\Enums\Core\ErrorMessageEnum;
use App\Enums\Core\FileTypeEnum;
use App\Models\User;
use App\Models\User\UserFile;
use App\Rules\BaseRule;

class CanOnboardRule extends BaseRule
{
    public function passes($attribute, $value): bool
    {
        /** @var User $user */
       $user = User::query()->find($this->data['user_id']);
       if ($user === null || $user->is_under_moderation || $user->is_onboarded) {
           return false;
       }

       $profilePhotoCount = UserFile::query()
           ->where('user_id', $this->data['user_id'])
           ->where('is_under_moderation', false)
           ->whereDoesntHave('moderation')
           ->where('type', FileTypeEnum::IMAGE)
           ->count();

       $verificationPhotoExists = UserFile::query()
           ->where('user_id', $this->data['user_id'])
           ->where('is_under_moderation', false)
           ->whereDoesntHave('moderation')
           ->where('type', FileTypeEnum::VERIFICATION_PHOTO)
           ->exists();

       if (
           $verificationPhotoExists === false
           || $profilePhotoCount < 3
       ) {
           $this->message = ErrorMessageEnum::VALIDATION_USER_DONT_HAVE_NEEDED_FILES->value;
           return false;
       }

       return true;
    }
}
