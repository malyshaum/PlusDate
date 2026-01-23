<?php

namespace App\Http\Requests\Chat;

use App\Http\Requests\BaseRequest;

class MarkMessageReadRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'message_id' => [
                'required',
                'int',
                'gt:0'
            ],
            'user_id' => [
                'required',
                'integer',
            ]
        ];
    }
}
