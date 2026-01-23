<?php

namespace App\Http\Requests\User;

use App\Enums\Core\FileTypeEnum;
use App\Http\Requests\BaseRequest;
use App\Rules\Moderation\CanUpdatePhotoRule;
use Illuminate\Validation\Rule;

class UpdateFilesRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'user_id' => [
                'required',
                'integer',
                'gt:0'
            ],
            'files' => [
                'sometimes',
                'array',
                'min:1'
            ],
            'files.*' => [
                'required',
                'array',
                CanUpdatePhotoRule::init($this->validationData())
            ],
            'files.*.file' => [
                'required',
                'file',
            ],
            'files.*.file_id' => [
                'integer',
                'nullable',
                'sometimes',
                'gt:0',
            ],
            'files.*.file_type' => [
                'required',
                'string',
                Rule::in(FileTypeEnum::values())
            ],
            'name' => [
                'sometimes',
                'string',
                'max:255',
            ],
            'instagram' => [
                'sometimes',
                'string',
                'max:255',
                'nullable',
            ],
            'profile_description' => [
                'sometimes',
                'string',
                'max:255',
                'nullable',
            ]
        ];
    }
}
