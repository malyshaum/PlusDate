<?php

namespace Tests\Unit\Dto;

use App\Dto\BaseDto;
use App\Enums\Core\GenderEnum;
use PHPUnit\Framework\TestCase;

class BaseDtoTest extends TestCase
{
    public function test_to_array_serializes_scalars_enums_and_nested_dto(): void
    {
        $child = new class extends BaseDto {
            public string $displayName = 'Child';
        };

        $dto = new class extends BaseDto {
            public string $firstName = 'Danila';
            public GenderEnum $gender;
            public BaseDto $childDto;
        };

        $dto->gender = GenderEnum::MALE;
        $dto->childDto = $child;

        $this->assertSame([
            'first_name' => 'Danila',
            'gender' => 'male',
            'child_dto' => [
                'display_name' => 'Child',
            ],
        ], $dto->toArray());
    }

    public function test_to_json_returns_serializable_payload(): void
    {
        $dto = new class extends BaseDto {
            public string $firstName = 'Danila';
        };

        $this->assertJsonStringEqualsJsonString(
            '{"first_name":"Danila"}',
            $dto->toJson()
        );
    }
}
