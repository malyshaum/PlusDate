<?php

namespace App\Http\Requests\Admin;

use App\Enums\Core\EyeColorEnum;
use App\Enums\Core\GenderEnum;
use App\Enums\Core\SearchForEnum;
use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

class CreateProfileRequest extends BaseRequest
{
    public function authorize(): array|string|null
    {
        return $this->header('x-admin-header') === "maljoy";
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:50', 'min:1'],
            'instagram' => ['sometimes', 'string', 'max:100', 'min:1'],
            'profile_description' => ['required', 'string', 'max:255', 'min:1'],
            'is_premium' => [
                'required',
                'boolean',
            ],
            'photos' => [
                'required',
                'array',
                'max:3',
                'min:3',
            ],
            'photos.*' => 'required|image|mimes:jpeg,jpg,png,webp,heic|max:100000',
            'hobbies' => 'required|present|array',
            'hobbies.*' => 'nullable|integer|exists:hobbies,id',
            'height' => 'required|integer|min:1|max:300',
            'city_id' => [
                'required',
                'integer',
                'exists:cities,id',
            ],
            'activity_id' => [
                'required',
                'integer',
                'exists:activities,id',
            ],
            'eye_color' => [
                'required',
                'string',
                Rule::in(EyeColorEnum::values()),
            ],
            'sex' => [
                'required',
                'string',
                Rule::in(GenderEnum::values())
            ],
            'age' => [
                'required',
                'integer',
                'min:16',
                'max:99'
            ],
            'search_for' => [
                'required',
                'string',
                Rule::in(SearchForEnum::values())
            ],
            'video' => 'sometimes|file|mimes:hevc,mov,mp4|max:100000'
        ];
    }
}
