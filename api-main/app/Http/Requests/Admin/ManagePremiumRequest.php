<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Enums\Payment\SubscriptionTypeEnum;
use App\Http\Requests\BaseRequest;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class ManagePremiumRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'user_id' => [
                'required',
                'integer',
                'gt:0',
                'exists:users,id'
            ],
            'period' => [
                'required',
                Rule::enum(SubscriptionTypeEnum::class),
            ],
        ];
    }

    public function getUserId(): int
    {
        return (int)$this->input('user_id');
    }

    public function getPeriod(): SubscriptionTypeEnum
    {
        return SubscriptionTypeEnum::from($this->input('period'));
    }
}
