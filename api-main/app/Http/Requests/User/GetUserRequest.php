<?php

namespace App\Http\Requests\User;

use App\Http\Requests\BaseRequest;
use App\Rules\UserProfile\UserCanSeeProfileRule;

class GetUserRequest extends BaseRequest
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
            'user_id' => [
                'required',
                'integer',
                'gt:0'
            ],
            'id' => [
                'required',
                'integer',
                'gt:0',
                UserCanSeeProfileRule::init($this->validationData())
            ]
        ];
    }
}
