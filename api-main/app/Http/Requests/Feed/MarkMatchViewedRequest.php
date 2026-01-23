<?php

namespace App\Http\Requests\Feed;

use App\Http\Requests\BaseRequest;

class MarkMatchViewedRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'user_id' => 'required|integer',
            'profile_id' => 'required|integer|gt:0',
        ];
    }
}
