<?php

namespace App\Dto\Storage;

use App\Dto\BaseDto;

class ReorderFilesDto extends BaseDto
{
    public int $userId;
    /** @var ReorderFileItemDto[] */
    public array $items;
}

