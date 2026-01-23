<?php

declare(strict_types=1);

namespace App\Http\Requests\User;

use App\Enums\Core\ErrorMessageEnum;
use App\Http\Requests\BaseRequest;

final class BlockUserRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'blocked_user_id' => [
                'required',
                'integer',
                'exists:users,id',
                function ($attribute, $value, $fail) {
                    if ((int)$value === $this->getAuthUserId()) {
                        $fail(ErrorMessageEnum::BLOCK_ACCOUNT_MYSELF->value);
                    }
                },
            ],
        ];
    }

    public function getBlockedUserId(): int
    {
        return (int)$this->input('blocked_user_id');
    }
}
