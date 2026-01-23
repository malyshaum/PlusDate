<?php

namespace App\Http\Requests\Feed;

use App\Http\Requests\BaseRequest;
use App\Rules\Feed\CanRevertSwipeRule;

class RollbackSwipeRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'user_id' => [
                'required',
                'integer',
            ],
            'swipe_id' => [
                'required',
                'integer',
                CanRevertSwipeRule::init($this->validationData())
            ]
        ];
    }
}
