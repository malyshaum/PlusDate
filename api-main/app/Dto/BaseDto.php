<?php

namespace App\Dto;

use Illuminate\Support\Str;
use UnitEnum;

class BaseDto
{
    public function toArray(): array
    {
        $data = [];
        $vars = get_object_vars($this);
        foreach ($vars as $key => $value) {
            if ($value instanceof UnitEnum) {
                $data[Str::snake($key)] = $value->value;
                continue;
            }

            if ($value instanceof BaseDto) {
                $data[Str::snake($key)] = $value->toArray();
                continue;
            }

            $data[Str::snake($key)] = $value;
        }
        return $data;
    }

    public function toJson(): string
    {
        return json_encode($this->toArray());
    }
}
