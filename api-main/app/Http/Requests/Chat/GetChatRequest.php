<?php

namespace App\Http\Requests\Chat;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class GetChatRequest extends FormRequest
{
    public function validationData(): array
    {
        $data = $this->all();
        $data['user_id'] = Auth::id();

        return $data;
    }

    public function rules(): array
    {
        return [
            'user_id' => [
                'required',
                'integer'
            ],
            'cursor' => [
                'sometimes',
                'string'
            ],
            'has_messages' => [
                'sometimes',
                'boolean'
            ]
        ];
    }
}
