<?php

namespace App\Http\Requests\User;

use App\Http\Requests\BaseRequest;

class GetMatchesRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'user_id' => [
                'required',
                'integer'
            ],
            'cursor' => [
                'string',
                'sometimes',
                'nullable'
            ],
        ];
    }
}
