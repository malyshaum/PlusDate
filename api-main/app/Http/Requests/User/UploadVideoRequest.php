<?php

namespace App\Http\Requests\User;

use App\Enums\Core\FileTypeEnum;
use App\Http\Requests\BaseRequest;
use App\Rules\User\CanUploadFileRule;

class UploadVideoRequest extends BaseRequest
{
    public function validationData(): array
    {
        $data = parent::validationData();
        $data['file_type'] = FileTypeEnum::VIDEO->value;

        return $data;
    }

    public function rules(): array
    {
        return [
            'user_id' => [
                'required',
                'integer',
                'gt:0',
                CanUploadFileRule::init($this->validationData())
            ],
            'file' => [
                'required',
                'file',
                'mimes:hevc,mov,mp4',
                'max:100000',
            ],
            'file_id' => [
                'integer',
                'nullable',
                'sometimes',
                'gt:0',
            ],
            'order' => [
                'sometimes',
                'integer',
                'min:0'
            ],
            'file_type' => [
                'required',
                'string'
            ]
        ];
    }
}
