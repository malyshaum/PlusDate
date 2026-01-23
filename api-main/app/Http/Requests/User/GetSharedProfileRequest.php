<?php

namespace App\Http\Requests\User;

use App\Http\Requests\BaseRequest;

final class GetSharedProfileRequest extends BaseRequest
{
    public function validationData(): array
    {
        $data = parent::validationData();
        $data['id'] = $this->route('id');

        return $data;
    }

    public function rules(): array
    {
        return [
            'id' => [
                'required',
                'integer',
                'gt:0',
                'exists:users,id'
            ]
        ];
    }

    public function getId(): int
    {
        return (int)$this->validated('id');
    }
}
