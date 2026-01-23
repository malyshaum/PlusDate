<?php

namespace App\Http\Requests\Feed;

use App\Http\Requests\BaseRequest;
use App\Rules\Feed\CanDeleteMatchRule;

class DeleteMatchRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'user_id' => 'required|integer',
            'profile_id' => [
                'required',
                'integer',
                'gt:0',
                CanDeleteMatchRule::init($this->validationData())
            ]
        ];
    }
}
