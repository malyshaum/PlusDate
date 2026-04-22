<?php

namespace App\Mapping\User;

use App\Dto\User\UpsertUserDto;
use App\Dto\User\UserFeedProfileDto;
use App\Dto\User\UserSearchPreferenceDto;
use App\Dto\User\UserSettingsDto;
use App\Enums\Core\SearchForEnum;
use App\Enums\Core\GenderEnum;
use App\Enums\Core\ZodiacSignEnum;
use App\Http\Requests\User\UpsertUserProfileRequest;
use App\Models\Dictionary\City;
use App\Models\Dictionary\Country;
use App\Models\User;
use AutoMapperPlus\AutoMapper;
use AutoMapperPlus\CustomMapper\CustomMapper;
use AutoMapperPlus\Exception\UnregisteredMappingException;
use Clickbar\Magellan\Data\Geometries\Point;
use Illuminate\Support\Facades\App;

class UpsertUserProfileRequestToUpsertUserProfileDtoMapper extends CustomMapper
{
    private readonly User $user;

    public function __construct(
        private readonly AutoMapper $mapper,
    ){
        //
    }

    /**
     * @param UpsertUserProfileRequest $source
     * @param UpsertUserDto $destination
     * @throws UnregisteredMappingException
     */
    public function mapToObject($source, $destination): UpsertUserDto
    {
        $data = $source->validated();

        $this->user = User::query()
            ->with(['feedProfile','searchPreference'])
            ->findOrFail($data['user_id']);

        /** @see UserMapping::configure */
        $this->mapper->mapToObject($this->user->toArray(), $destination);

        $destination->isOnboarded = true;

        if ($source->file('verification_photo')) {
            $destination->verificationPhoto = $source->file('verification_photo');
        }

        if (isset($data['telegram_premium'])) {
            $destination->telegramPremium = (bool)$data['telegram_premium'];
        }

        if (array_key_exists('instagram', $data)) {
            $destination->instagram = $source->input('instagram');
        }

        if (array_key_exists('profile_description', $data)) {
            $destination->profileDescription = $source->input('profile_description');
        }

        if ($source->file('photos')) {
            $destination->photos = $source->file('photos',[]);
        }

        if ($source->file('videos')) {
            $destination->videos = $source->file('videos',[]);
        }

        if (isset($data['name'])) {
            $destination->name = $data['name'];
        }

        if ($this->user->settings !== null) {
            /** @see UserMapping::configureArrayToUserSettingsDto */
            $destination->settings = $this->mapper->map(
                $this->user->settings->toArray(), UserSettingsDto::class
            );
        } else {
            $destination->settings = new UserSettingsDto;
            $destination->settings->hideInstagram = false;
            $destination->settings->disableNotifications = false;
        }

        if (isset($data['settings']['disable_notifications'])) {
            $destination->settings->disableNotifications = $data['settings']['disable_notifications'];
        }

        if (isset($data['settings']['hide_instagram'])){
            $destination->settings->hideInstagram = $data['settings']['hide_instagram'];
        }

        if (isset($data['settings']['hide_age'])){
            $destination->settings->hideAge = $data['settings']['hide_age'];
        }

        if ($source->input('language_code')) {
            $destination->languageCode = $source->input('language_code');
        }

        $this->fillFeedProfile($source, $destination);
        $this->fillSearchPreference($source, $destination);

        return $destination;
    }

    private function fillSearchPreference(UpsertUserProfileRequest $source, UpsertUserDto $destination): void
    {
        $data = $source->all();

        if ($this->user->searchPreference === null) {
            $feedProfileSex = $destination->feedProfile?->sex;
            if ($feedProfileSex === null && $this->user->feedProfile !== null) {
                $feedProfileSex = GenderEnum::tryFrom($this->user->feedProfile->sex);
            }

            $gender = GenderEnum::MALE;
            if (
                $feedProfileSex === GenderEnum::MALE
                || (isset($data['gender']) && $data['gender'] === GenderEnum::MALE->value)
            ) {
                 $gender = GenderEnum::FEMALE;
            }

            $destination->searchPreference = new UserSearchPreferenceDto();
            $destination->searchPreference->cityId = $data['city_id'] ?? $this->user->feedProfile?->city_id;
            $destination->searchPreference->includeNearby = false;
            $destination->searchPreference->withVideo = false;
            $destination->searchPreference->fromAge = 18;
            $destination->searchPreference->toAge = 60;
            $destination->searchPreference->expandAgeRange = false;
            $destination->searchPreference->gender = $gender;
            $destination->searchPreference->searchFor = SearchForEnum::tryFrom($data['search_for'] ?? 'no_answer');
            $destination->searchPreference->userId = $this->user->id;
        }
    }

    private function fillFeedProfile(UpsertUserProfileRequest $source, UpsertUserDto $destination): void
    {
        $data = $source->all();
        $feedProfileDto = new UserFeedProfileDto();

        if (isset($data['city_id'])) {
            $city = City::query()->find((int)$data['city_id']);
            $feedProfileDto->cityId = $city->id;
            $feedProfileDto->coordinates = $city->location;

            $country = Country::query()->where('country_code', $city->country_code)->firstOrFail();
            $feedProfileDto->countryId = $country->id;
        } elseif (isset($data['coordinates'])) {
            $feedProfileDto->coordinates = Point::make($data['coordinates']['latitude'], $data['coordinates']['longitude']);
        }

        if(isset($data['sex'])) {
            $feedProfileDto->sex = GenderEnum::tryFrom($data['sex']);
        }

        if (isset($data['age'])) {
            $feedProfileDto->age = $data['age'];
        }

        if (isset($data['search_for'])) {
            $feedProfileDto->searchFor = SearchForEnum::tryFrom($data['search_for']);
        }

        if (isset($data['hobbies'])) {
            $feedProfileDto->hobbies = array_filter($data['hobbies'], fn($item) => $item !== null);
        }

        if (isset($data['eye_color'])) {
            $feedProfileDto->eyeColor = $data['eye_color'];
        }

        if (array_key_exists('zodiac_sign', $data)) {
            $feedProfileDto->zodiacSign = $data['zodiac_sign'] !== null 
                ? ZodiacSignEnum::tryFrom($data['zodiac_sign']) 
                : null;
        }

        if (isset($data['height'])) {
            $feedProfileDto->height = (int)$data['height'];
        }

        if (isset($data['activity_ids']) && is_array($data['activity_ids'])) {
            $feedProfileDto->activityIds = array_filter($data['activity_ids'], fn($id) => $id !== null);
            if (!empty($feedProfileDto->activityIds)) {
                $feedProfileDto->activityId = $feedProfileDto->activityIds[0];
            }
        } elseif (isset($data['activity_id'])) {
            $feedProfileDto->activityIds = [$data['activity_id']];
            $feedProfileDto->activityId = $data['activity_id'];
        }

        if(!empty(get_object_vars($feedProfileDto))) {
            $feedProfileDto->userId = $destination->id;
            $destination->feedProfile = $feedProfileDto;
        }
    }
}
