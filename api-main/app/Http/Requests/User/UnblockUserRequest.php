<?php

declare(strict_types=1);

namespace App\Http\Requests\User;

use App\Http\Requests\BaseRequest;

final class UnblockUserRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'blocked_user_id' => [
                'required',
                'integer',
                'exists:users,id',
            ],
        ];
    }

    public function getBlockedUserId(): int
    {
        return (int)$this->validated('blocked_user_id');
    }
}
