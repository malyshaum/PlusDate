<?php

namespace App\Rules\User;

use App\Enums\Core\ErrorMessageEnum;
use App\Rules\BaseRule;
use App\Services\User\UserService;
use Illuminate\Support\Facades\Auth;

class CanUpdateProfileRule extends BaseRule
{
    public function __construct(
        private readonly UserService $userService,
    )
    {

    }

    public function passes($attribute, $value): bool
    {
        $userDto = $this->userService->getById($this->data['user_id']);

        if ($userDto->id !== Auth::id()) {
            $this->message = ErrorMessageEnum::CANT_UPDATE_ENTITY_VALIDATION->value;
            return false;
        }

        if (!$userDto) {
            $this->message = ErrorMessageEnum::ENTITY_DOESNT_EXISTS_ERROR->value;
            return false;
        }

        return true;
    }
}
