<?php

namespace App\Http\Requests\Storage;

use App\Enums\Core\FileTypeEnum;
use App\Http\Requests\BaseRequest;
use App\Rules\User\CanUploadFileRule;
use Illuminate\Validation\Rule;

class UploadPhotoRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'user_id' => [
                'required',
                'integer',
                'gt:0'
            ],
            'file' => 'required|image|mimes:jpeg,jpg,png,webp,heic|max:100000',
            'file_id' => [
                'sometimes',
                'integer',
                'gt:0'
            ],
            'is_main' => [
                'sometimes',
                'boolean',
                // TODO: add validation that this is not verification_photo type
            ],
            'order' => [
                'sometimes',
                'integer',
                'min:0'
            ],
            'file_type' => [
                'required',
                'string',
                Rule::in([FileTypeEnum::IMAGE->value,FileTypeEnum::VERIFICATION_PHOTO->value]),
                CanUploadFileRule::init($this->validationData())
            ]
        ];
    }
}
