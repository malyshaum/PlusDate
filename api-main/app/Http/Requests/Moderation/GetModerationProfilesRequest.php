<?php

namespace App\Http\Requests\Moderation;

use App\Http\Requests\BaseRequest;

class GetModerationProfilesRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'per_page' => [
                'sometimes',
                'integer',
                'min:1',
                'max:100'
            ],
            'page' => [
                'sometimes',
                'integer',
                'gt:0'
            ],
        ];
    }
}
