<?php

namespace App\Http\Requests\Feed;

use App\Enums\Core\SwipeActionEnum;
use App\Rules\Feed\CanSwipeProfileRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class SwipeProfileRequest extends FormRequest
{
    public function validationData(): array
    {
        $data = $this->all();
        $data['user_id'] = Auth::id();

        if ($this->hasHeader('x-user-id')) {
            $data['user_id'] = (int)$this->header('x-user-id');
        }

        return $data;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'integer'],
            'profile_id' => ['required', 'integer', 'gt:0', CanSwipeProfileRule::init($this->validationData())],
            'action' => ['required', 'string', Rule::in(SwipeActionEnum::values())],
        ];
    }
}
