<?php

namespace App\Mapping\Storage;

use App\Dto\Storage\ReorderFileItemDto;
use App\Dto\Storage\ReorderFilesDto;
use AutoMapperPlus\AutoMapper;
use AutoMapperPlus\CustomMapper\CustomMapper;

class ArrayToReorderFilesDtoMapper extends CustomMapper
{
    public function __construct(
        private readonly AutoMapper $mapper,
    ) {
        //
    }

    /**
     * @param array $source
     * @param ReorderFilesDto $destination
     */
    public function mapToObject($source, $destination): ReorderFilesDto
    {
        $destination->userId = $source['user_id'];

        $destination->items = [];
        foreach ($source['items'] as $item) {
            $itemDto = new ReorderFileItemDto();
            $itemDto->fileId = $item['file_id'];
            $itemDto->order = $item['order'];
            $destination->items[] = $itemDto;
        }

        return $destination;
    }
}
