<?php

namespace App\Rules;

use App\Enums\Core\ErrorMessageEnum;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

abstract class BaseRule implements ValidationRule
{
    protected string $message = ErrorMessageEnum::VALIDATION_INVALID->value;
    protected array $data;
    protected array $context;

    public static function init(array $data = [], array $context = []): static
    {
        $me = app()->make(static::class);
        $me->data = $data;
        $me->context = $context;
        return $me;
    }

    abstract public function passes($attribute, $value);

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!$this->passes($attribute, $value)) {
            $fail($this->message);
        }
    }
}
