<?php

namespace App\Http\Requests\User;

use App\Http\Requests\BaseRequest;

class RestoreAccountRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'user_id' => ['required', 'integer'],
        ];
    }
}
