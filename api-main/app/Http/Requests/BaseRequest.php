<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class BaseRequest extends FormRequest
{
    public function validationData(): array
    {
        $data = parent::validationData();
        $data['user_id'] = $this->getAuthUserId();

        if ($this->hasHeader('x-user-id')) {
            $data['user_id'] = (int)$this->header('x-user-id');
        }

        return $data;
    }

    public function getAuthUserId(): int
    {
        return Auth::id();
    }
}
