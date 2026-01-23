<?php

namespace App\Http\Requests\Feed;

use App\Http\Requests\BaseRequest;

class GetFeedProfilesRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'user_id' => 'required|integer',
            'cursor' => 'nullable|string',
            'per_page' => 'nullable|integer|min:1|max:100',
            'skip_filter' => ['sometimes', 'boolean'],
        ];
    }
}
