<?php

namespace App\Http\Requests\User;

use App\Http\Requests\BaseRequest;

class PresenceRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'user_id' => ['required', 'integer'],
        ];
    }
}