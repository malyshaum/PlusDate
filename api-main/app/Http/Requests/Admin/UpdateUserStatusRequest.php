<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Enums\User\UserStatusEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateUserStatusRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'id' => [
                'required',
                'integer',
                'exists:users,id',
            ],
            'status' => [
                'required',
                'string',
                Rule::enum(UserStatusEnum::class),
            ],
        ];
    }

    public function getStatus(): UserStatusEnum
    {
        return UserStatusEnum::from($this->validated('status'));
    }

    public function getUserId(): int
    {
        return (int)$this->route('id');
    }
}
