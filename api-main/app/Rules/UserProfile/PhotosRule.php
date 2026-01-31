<?php

namespace App\Rules\UserProfile;

use App\Enums\Core\ErrorMessageEnum;
use App\Rules\BaseRule;
use Illuminate\Http\UploadedFile;

class PhotosRule extends BaseRule
{
    private const int MAXIMUM_PHOTOS = 3;

    protected string $message = ErrorMessageEnum::CANT_UPDATE_ENTITY_VALIDATION->value;

    public function passes($attribute, $value): bool
    {
        if (count($value) !== self::MAXIMUM_PHOTOS) {
            $this->message = ErrorMessageEnum::VALIDATION_WRONG_NUMBER_OF_PHOTOS->value;
            return false;
        }

        $photoHashes = [];
        foreach ($value as $photo) {
            if ($photo instanceof UploadedFile) {
                $fileSize = $photo->getSize();
                $fileHash = hash_file('sha256', $photo->getRealPath());
                $identifier = $fileSize . '_' . $fileHash;

                if (in_array($identifier, $photoHashes, true)) {
                    $this->message = ErrorMessageEnum::VALIDATION_DUPLICATE_PHOTOS->value;
                    return false;
                }

                $photoHashes[] = $identifier;
            }
        }

        return true;
    }
}
