<?php

namespace App\Dto\Storage;

use App\Dto\BaseDto;

class ReorderFileItemDto extends BaseDto
{
    public int $fileId;
    public int $order;
}