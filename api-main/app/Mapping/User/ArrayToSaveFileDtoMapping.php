<?php

namespace App\Mapping\User;

use App\Dto\Storage\SaveFileDto;
use App\Enums\Core\FileTypeEnum;
use AutoMapperPlus\CustomMapper\CustomMapper;

class ArrayToSaveFileDtoMapping extends CustomMapper
{
    /**
     * @param array $source
     * @param SaveFileDto $destination
     */
    public function mapToObject($source, $destination, $context = []): SaveFileDto
    {
        $destination->userId = $source['user_id'] ?? $context['user_id'];
        $destination->fileId = $source['file_id'] ?? null;
        $destination->file = $source['file'];
        $destination->fileType = FileTypeEnum::tryFrom($source['file_type'] ?? $context['file_type']);
        $destination->isUnderModeration = $source['is_under_moderation'] ?? false;
        $destination->order = isset($source['order']) ? (int)$source['order'] : null;

        return $destination;
    }
}
