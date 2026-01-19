<?php

namespace App\Dto\User;

use App\Dto\BaseDto;
use App\Enums\User\DeletionReasonEnum;

class DeleteAccountDto extends BaseDto
{
    public int $userId;
    /** @var DeletionReasonEnum[] */
    public array $reasons;
    public string|null $note = null;
    public bool $isAdminDelete = false;
    public int|null $deletedBy = null;
}
