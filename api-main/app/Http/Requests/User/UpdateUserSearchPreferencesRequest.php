<?php

namespace App\Http\Requests\User;

use App\Enums\Core\EyeColorEnum;
use App\Enums\Core\GenderEnum;
use App\Enums\Core\SearchForEnum;
use App\Enums\Core\ZodiacSignEnum;
use App\Rules\User\CanUpdateProfileRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UpdateUserSearchPreferencesRequest extends FormRequest
{
    public function validationData(): array
    {
        $data = $this->all();
        $data['user_id'] = Auth::id();

        return $data;
    }

    public function rules(): array
    {
        return [
            'user_id' => [
                'required',
                'integer',
                CanUpdateProfileRule::init($this->validationData()),
            ],
            'city_id' => [
                'nullable',
                'integer',
                'exists:cities,id',
            ],
            'include_nearby' => [
                'sometimes',
                'boolean',
            ],
            'from_age' => [
                'nullable',
                'integer',
                'min:18',
                'max:60'
            ],
            'to_age' => [
                'nullable',
                'integer',
                'min:18',
                'max:60'
            ],
            'expand_age_range' => [
                'sometimes',
                'boolean',
            ],
            'gender' => [
                'nullable',
                'string',
                Rule::in(GenderEnum::values())
            ],
            'search_for' => [
                'nullable',
                'string',
                Rule::in(SearchForEnum::values())
            ],
            'eye_color' => [
                'nullable',
                'sometimes',
                'present',
                'array',
            ],
            'eye_color.*' => [
                'required',
                'string',
                Rule::in(EyeColorEnum::values())
            ],
            'zodiac_signs' => [
                'nullable',
                'sometimes',
                'present',
                'array',
            ],
            'zodiac_signs.*' => [
                'required',
                'string',
                Rule::in(ZodiacSignEnum::values())
            ],
            'height_from' => [
                'nullable',
                'integer',
                'min:1',
                'max:300',
            ],
            'height_to' => [
                'nullable',
                'integer',
                'min:1',
                'max:300',
            ],
            'activity_id' => [
                'nullable',
                'integer',
                'exists:activities,id',
            ],
            'activity_ids' => [
                'nullable',
                'array',
            ],
            'activity_ids.*' => [
                'required',
                'integer',
                'exists:activities,id',
            ],
            'hobbies' => [
                'nullable',
                'present',
                'sometimes',
                'array',
            ],
            'hobbies.*' => [
                'integer',
                'required',
            ],
            'with_video' => [
                'nullable',
                'boolean',
            ],
            'with_premium' => [
                'nullable',
                'boolean',
            ],
        ];
    }
}
