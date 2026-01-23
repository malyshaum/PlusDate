<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class GetLikesRequest extends FormRequest
{
    public function validationData(): array
    {
        $data = $this->all();
        $data['user_id'] = Auth::id();

        if (isset($data['only_mutual'])) {
            $data['only_mutual'] = filter_var($data['only_mutual'], FILTER_VALIDATE_BOOLEAN);
        }

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
                'string',
                'sometimes',
                'nullable'
            ],
            'only_mutual' => [
                'boolean',
                'sometimes'
            ]
        ];
    }
}
