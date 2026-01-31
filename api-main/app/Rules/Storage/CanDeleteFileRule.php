<?php

namespace App\Rules\Storage;

use App\Models\User;
use App\Models\User\UserFile;
use App\Rules\BaseRule;
use Illuminate\Support\Facades\Auth;

class CanDeleteFileRule extends BaseRule
{
    public function passes($attribute, $value): bool
    {
        $file = UserFile::query()->find($value);
        if ($file === null) {
            return false;
        }

        /** @var User $user */
        $user = Auth::user();

        if ($file->user_id !== $user->id) {
            return false;
        }

        if ($file->is_under_moderation) {
            return false;
        }

        $replaceExists = UserFile::query()->where('file_id', $file->id)->exists();
        if ($replaceExists) {
            return false;
        }

        return true;
    }
}
