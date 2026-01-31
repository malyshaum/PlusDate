<?php

namespace App\Rules\Feed;

use App\Enums\Core\ErrorMessageEnum;
use App\Enums\Core\SwipeActionEnum;
use App\Rules\BaseRule;
use Illuminate\Support\Facades\DB;

class CanDeleteMatchRule extends BaseRule
{
    protected string $message = ErrorMessageEnum::VALIDATION_NOT_VALID_SWIPE->value;

    public function passes($attribute, $value): bool
    {
        $profileId = (int)$value;
        $userId = $this->data['user_id'];
        
        $profile = DB::table('user_feed_profile')
            ->where('id', $profileId)
            ->first();

        if ($profile === null) {
            $this->message = ErrorMessageEnum::VALIDATION_USER_DOES_NOT_HAVE_FEED_PROFILE->value;
            return false;
        }

        $currentUserProfile = DB::table('user_feed_profile')
            ->where('user_id', $userId)
            ->first();

        if ($currentUserProfile === null) {
            $this->message = ErrorMessageEnum::VALIDATION_USER_DOES_NOT_HAVE_FEED_PROFILE->value;
            return false;
        }

        $userSwipe = DB::table('user_swipes')
            ->where('user_id', $userId)
            ->where('profile_id', $profileId)
            ->whereIn('action', [SwipeActionEnum::LIKE->value, SwipeActionEnum::SUPERLIKE->value])
            ->exists();

        if (!$userSwipe) {
            return false;
        }

        $mutualSwipe = DB::table('user_swipes')
            ->where('user_id', $profile->user_id)
            ->where('profile_id', $currentUserProfile->id)
            ->whereIn('action', [SwipeActionEnum::LIKE->value, SwipeActionEnum::SUPERLIKE->value])
            ->exists();

        if (!$mutualSwipe) {
            $this->message = ErrorMessageEnum::VALIDATION_NOT_VALID_SWIPE->value;
            return false;
        }

        return true;
    }
}

