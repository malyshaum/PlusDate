<?php

namespace App\Dto\Storage;

use App\Enums\Core\FileTypeEnum;
use Illuminate\Http\UploadedFile;

class SaveFileDto
{
    public int $userId;
    public int|null $fileId = null;
    public UploadedFile $file;
    public FileTypeEnum $fileType;
    public bool $isUnderModeration = false;
    public bool $deleteParent = false;
    public bool $isMain = false;
    public int|null $order = null;
}
