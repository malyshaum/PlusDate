<?php

namespace App\Rules\UserProfile;

use App\Enums\Core\ErrorMessageEnum;
use App\Rules\BaseRule;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

class UserCanSeeProfileRule extends BaseRule
{
    protected string $message = ErrorMessageEnum::VALIDATION_USER_CANT_SEE_PROFILE->value;

    public function passes($attribute, $value): bool
    {
        if ((int)$this->data['user_id'] === (int)$value) {
            return true;
        }

        $currentUserProfileId = DB::table('user_feed_profile')
            ->select(['id'])
            ->where('user_id', $this->data['user_id'])
            ->first();

        return DB::table('user_swipes')
            ->where(function(Builder $query) use ($currentUserProfileId) {
                $query->where('user_id', (int)$this->data['id'])
                    ->where('profile_id', $currentUserProfileId->id);
            })->exists();
    }
}
