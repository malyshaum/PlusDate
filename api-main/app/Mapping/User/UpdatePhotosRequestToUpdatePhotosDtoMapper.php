<?php

namespace App\Mapping\User;

use App\Dto\User\UpdatePhotosDto;
use App\Http\Requests\User\UpdatePhotosRequest;
use AutoMapperPlus\CustomMapper\CustomMapper;

class UpdatePhotosRequestToUpdatePhotosDtoMapper extends CustomMapper
{
    /**
     * @param UpdatePhotosRequest $source
     * @param UpdatePhotosDto $destination
     * @return UpdatePhotosDto
     */
    public function mapToObject($source, $destination): UpdatePhotosDto
    {
        $data = $source->validated();

        $destination->userId = $data['user_id'];

        foreach ($data['photos'] as $photoData) {
            $destination->photos[] = [
                'file_id' => $photoData['file_id'],
                'file' => $photoData['file'],
                'order' => $photoData['order'] ?? null,
            ];
        }

        return $destination;
    }
}
