<?php

namespace App\Http\Requests\Feed;

use App\Enums\Core\SwipeActionEnum;
use App\Http\Requests\BaseRequest;
use App\Rules\Feed\CanSwipeProfileRule;
use Illuminate\Validation\Rule;

class RespondToLikeRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'user_id' => [
                'required',
                'integer'
            ],
            'profile_id' => ['required', 'integer', 'gt:0', CanSwipeProfileRule::init($this->validationData(),['respond' => true])],
            'action' => ['required', 'string', Rule::in(SwipeActionEnum::values())],
        ];
    }
}
