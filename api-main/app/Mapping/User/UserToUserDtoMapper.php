<?php

namespace App\Mapping\User;

use App\Dto\User\UserDto;
use App\Dto\User\UserFeedProfileDto;
use App\Models\User;
use AutoMapperPlus\AutoMapper;
use AutoMapperPlus\CustomMapper\CustomMapper;
use AutoMapperPlus\Exception\UnregisteredMappingException;
use Illuminate\Support\Carbon;

class UserToUserDtoMapper extends CustomMapper
{
    public function __construct(
        private readonly AutoMapper $mapper,
    )
    {

    }

    /**
     * @param User $source
     * @param UserDto $destination
     * @throws UnregisteredMappingException
     */
    public function mapToObject($source, $destination): UserDto
    {
        $destination->id = $source->getAttribute('id');
        $destination->name = $source->getAttribute('name');
        $destination->username = $source->getAttribute('username') ?? null;
        $destination->photoUrl = $source->getAttribute('photo_url');
        $destination->isUnderModeration = $source->getAttribute('is_under_moderation');
        $destination->isOnboarded = $source->getAttribute('is_onboarded');
        $destination->isTrialUsed = $source->getAttribute('is_trial_used') ?? false;
        $destination->isPremium = $source->getAttribute('is_premium') ?? false;
        $destination->blocked = $source->getAttribute('blocked') ?? false;
        $destination->instagram = $source->getAttribute('instagram');
        $destination->languageCode = $source->getAttribute('language_code');
        $destination->profileDescription = $source->getAttribute('profile_description');

        if($source->relationLoaded('feedProfile')) {
            /** @see UserMapping */
            $destination->feedProfile = $this->mapper->map($source->feedProfile?->toArray(),UserFeedProfileDto::class);
        }

        $destination->files = $source->validFiles;
        $destination->photos = $source->photos;
        $destination->videos = $source->videos;

        $destination->deletedAt = $source->getAttribute('deleted_at');

        $destination->blockedAt = $this->mapBlockedAt($source);

        return $destination;
    }

    private function mapBlockedAt($source): ?Carbon
    {
        $blockedAt = $source->getAttribute('blocked_at');

        if ($blockedAt instanceof Carbon) {
            return $blockedAt;
        }

        return $blockedAt ? Carbon::parse($blockedAt) : null;
    }
}
