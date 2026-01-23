<?php

namespace App\Http\Requests\Moderation;

use App\Enums\Moderation\RejectionReasonEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateModerationStatusRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'user_id' => [
                'required',
                'integer',
                'gt:0'
            ],
            'rejection_reasons' => [
                'array',
                'nullable',
                'required_if:accepted,false'
            ],
            'rejection_reasons.*' => [
                'array',
                'min:1'
            ],
            'rejection_reasons.*.reason' => [
                'integer',
                'required',
                Rule::in(RejectionReasonEnum::values())
            ],
            'rejection_reasons.*.file_id' => [
                'sometimes',
                'nullable',
                'integer'
            ],
            'rejection_reasons.*.note' => [
                'sometimes',
                'nullable',
                'string',
                'max:500'
            ],
            'accepted' => [
                'required',
                'boolean'
            ]
        ];
    }
}
