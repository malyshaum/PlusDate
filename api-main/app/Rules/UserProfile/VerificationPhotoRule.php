<?php

namespace App\Rules\UserProfile;

use App\Enums\Core\ErrorMessageEnum;
use App\Rules\BaseRule;
use App\Services\User\UserService;

class VerificationPhotoRule extends BaseRule
{
    protected string $message = ErrorMessageEnum::VALIDATION_NO_VERIFICATION_PHOTO_PROVIDED->value;

    public function __construct(
        private readonly UserService $userService,
    )
    {

    }

    public function passes($attribute, $value): bool
    {
        $userDto = $this->userService->getById($this->data['user_id']);
        if (empty($userDto)) {
            $this->message = ErrorMessageEnum::ENTITY_DOESNT_EXISTS_ERROR->value;

            return false;
        }

//        if ($userDto->isOnboarded === true) {
//            $this->message = ErrorMessageEnum::VALIDATION_USER_ALREADY_ONBOARDED->value;
//
//            return false;
//        }

        return true;
    }
}
