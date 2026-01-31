<?php

namespace App\Rules\Feed;

use App\Enums\Core\ErrorMessageEnum;
use App\Enums\Core\SwipeActionEnum;
use App\Rules\BaseRule;
use Illuminate\Support\Facades\DB;

class CanRevertSwipeRule extends BaseRule
{
    public string $message = ErrorMessageEnum::VALIDATION_NOT_VALID_SWIPE->value;

    public function passes($attribute, $value): bool
    {
        return DB::table('user_swipes')
            ->where('id', (int)$value)
            ->where('user_id', $this->data['user_id'])
            ->where('action', SwipeActionEnum::DISLIKE)
            ->exists();
    }
}
