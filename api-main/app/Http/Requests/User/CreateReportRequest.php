<?php

namespace App\Http\Requests\User;

use App\Enums\User\ReportReasonEnum;
use App\Enums\User\ReportSourceEnum;
use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

final class CreateReportRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'user_id' => [
                'required',
                'integer',
                'gt:0'
            ],
            'reported_user_id' => [
                'required',
                'integer',
                'gt:0',
                'different:user_id',
                'exists:users,id'
            ],
            'reason_code' => [
                'required',
                'string',
                Rule::in(ReportReasonEnum::values())
            ],
            'custom_text' => [
                'required_if:reason_code,' . ReportReasonEnum::OTHER->value,
                'nullable',
                'string',
                'max:120'
            ],
            'source' => [
                'required',
                'string',
                Rule::in(ReportSourceEnum::values())
            ],
        ];
    }
}
