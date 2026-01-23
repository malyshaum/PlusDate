<?php

namespace App\Http\Requests\Storage;

use App\Http\Requests\BaseRequest;
use App\Rules\Storage\CanReorderFilesRule;

class ReorderFilesRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'user_id' => [
                'required',
                'integer',
                'gt:0'
            ],
            'items' => [
                'required',
                'array',
                'min:1',
                CanReorderFilesRule::init($this->validationData())
            ],
            'items.*.file_id' => [
                'required',
                'integer',
                'gt:0',
                'exists:user_files,id'
            ],
            'items.*.order' => [
                'required',
                'integer',
                'min:0'
            ],
        ];
    }
}
