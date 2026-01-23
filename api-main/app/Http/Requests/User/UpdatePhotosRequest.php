<?php

namespace App\Http\Requests\User;

use App\Http\Requests\BaseRequest;
use App\Rules\User\CanUpdatePhotoRule;
use App\Rules\User\CanUpdateProfileRule;

class UpdatePhotosRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'user_id' => [
                'required',
                'gt:0',
                CanUpdateProfileRule::init($this->validationData())
            ],
            'photos' => [
                'required',
                'array',
                'min:1',
            ],
            'photos.*' => [
                'required',
                'array',
            ],
            'photos.*.file_id' => [
                'required',
                'gt:0',
                CanUpdatePhotoRule::init($this->validationData())
            ],
            'photos.*.file' => [
                'required',
                'image',
                'mimes:jpeg,jpg,png,webp|max:5120',
            ],
            'photos.*.order' => [
                'sometimes',
                'integer',
                'min:0'
            ]
        ];
    }
}
