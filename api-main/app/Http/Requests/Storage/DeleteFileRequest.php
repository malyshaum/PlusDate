<?php

namespace App\Http\Requests\Storage;

use App\Rules\Storage\CanDeleteFileRule;
use Illuminate\Foundation\Http\FormRequest;

class DeleteFileRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'id' => [
                'required',
                'integer',
                'gt:0',
                CanDeleteFileRule::init($this->all()),
            ]
        ];
    }
}
