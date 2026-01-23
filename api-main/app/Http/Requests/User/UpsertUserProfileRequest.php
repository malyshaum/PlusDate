<?php

namespace App\Http\Requests\User;

use App\Enums\Core\EyeColorEnum;
use App\Enums\Core\LanguageCodeEnum;
use App\Enums\Core\SearchForEnum;
use App\Enums\Core\GenderEnum;
use App\Enums\Core\ZodiacSignEnum;
use App\Http\Requests\BaseRequest;
use App\Rules\User\CanUpdateProfileRule;
use App\Rules\UserProfile\CanUserChangePremiumSettingsRule;
use App\Rules\UserProfile\PhotosRule;
use App\Rules\UserProfile\VerificationPhotoRule;
use Illuminate\Validation\Rule;

class UpsertUserProfileRequest extends BaseRequest
{
    public function validationData(): array
    {
        $data = parent::validationData();

        if (isset($data['settings']['disable_notifications'])) {
            $data['settings']['disable_notifications'] = filter_var($data['settings']['disable_notifications'], FILTER_VALIDATE_BOOLEAN);
        }

        if (isset($data['settings']['hide_instagram'])) {
            $data['settings']['hide_instagram'] = filter_var($data['settings']['hide_instagram'], FILTER_VALIDATE_BOOLEAN);
        }

        if (isset($data['settings']['hide_age'])) {
            $data['settings']['hide_age'] = filter_var($data['settings']['hide_age'], FILTER_VALIDATE_BOOLEAN);
        }

        return $data;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', CanUpdateProfileRule::init($this->validationData())],

            'name' => ['sometimes', 'string', 'max:50', 'min:2'],
            'instagram' => ['sometimes', 'string', 'nullable', 'max:100'],
            'profile_description' => ['sometimes', 'string', 'nullable', 'max:255'],

            'videos' => 'sometimes|array|min:1|max:1',
            'videos.*' => 'required|file|mimes:hevc,mov,mp4|max:100000',

            'photos' => [
                'sometimes',
                'array',
                PhotosRule::init($this->data())
            ],
            'photos.*' => 'required|image|mimes:jpeg,jpg,png,webp,heic|max:100000',

            'verification_photo' => [
                'sometimes',
                'image',
                'mimes:jpeg,jpg,png,webp|max:5120',
                VerificationPhotoRule::init($this->validationData())
            ],
            'city_id' => 'sometimes|exists:cities,id',
            'activity_id' => 'sometimes|exists:activities,id',
            'activity_ids' => 'sometimes|array',
            'activity_ids.*' => 'integer|exists:activities,id',
            'hobbies' => 'sometimes|present|array',
            'hobbies.*' => 'nullable|integer|exists:hobbies,id',
            'height' => 'sometimes|integer|min:1|max:300',
            'telegram_premium' => 'sometimes|boolean',
            'eye_color' => [
                'sometimes',
                'string',
                Rule::in(EyeColorEnum::values()),
            ],
            'zodiac_sign' => [
                'sometimes',
                'string',
                'nullable',
                Rule::in(ZodiacSignEnum::values()),
            ],

            'sex' => [
                'sometimes',
                'string',
                Rule::in(GenderEnum::values())
            ],
            'age' => [
                'sometimes',
                'integer',
                'min:16',
                'max:99'
            ],
            'search_for' => [
                'sometimes',
                'string',
                Rule::in(SearchForEnum::values())
            ],

            'coordinates' => ['nullable', 'array', 'sometimes', 'min:1'],
            'coordinates.latitude' => [
                'sometimes',
                'numeric',
                'between:-90,90'
            ],
            'coordinates.longitude' => [
                'sometimes',
                'numeric',
                'between:-180,180'
            ],
            'language_code' => [
                'sometimes',
                'string',
                Rule::in(LanguageCodeEnum::values())
            ],
            'settings' => [
                'sometimes',
                'array',
                'min:1'
            ],
            'settings.disable_notifications' => [
                'sometimes',
                'boolean',
            ],
            'settings.hide_instagram' => [
                'sometimes',
                'boolean',
                CanUserChangePremiumSettingsRule::init($this->data())
            ],
            'settings.hide_age' => [
                'sometimes',
                'boolean',
                CanUserChangePremiumSettingsRule::init($this->data())
            ]
        ];
    }
}
