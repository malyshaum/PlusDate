<?php

namespace Tests\Unit\Enums;

use App\Enums\Core\EyeColorEnum;
use App\Enums\Core\GenderEnum;
use App\Enums\Core\LanguageCodeEnum;
use App\Enums\Core\SearchForEnum;
use App\Enums\Core\SwipeActionEnum;
use App\Enums\Moderation\RejectionReasonEnum;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class BaseEnumTraitTest extends TestCase
{
    public static function enumProvider(): array
    {
        return [
            'gender' => [GenderEnum::class, ['male', 'female'], ['MALE', 'FEMALE'], GenderEnum::MALE, 'male', 'MALE'],
            'search_for' => [SearchForEnum::class, ['relations', 'friends', 'no_answer'], ['RELATIONS', 'FRIENDS', 'NO_ANSWER'], SearchForEnum::RELATIONS, 'relations', 'RELATIONS'],
            'swipe_action' => [SwipeActionEnum::class, ['like', 'dislike', 'superlike'], ['LIKE', 'DISLIKE', 'SUPERLIKE'], SwipeActionEnum::LIKE, 'like', 'LIKE'],
            'eye_color' => [EyeColorEnum::class, ['green', 'yellow', 'blue', 'grey', 'brown'], ['GREEN', 'YELLOW', 'BLUE', 'GREY', 'BROWN'], EyeColorEnum::GREEN, 'green', 'GREEN'],
            'language_code' => [LanguageCodeEnum::class, ['en', 'ru'], ['EN', 'RU'], LanguageCodeEnum::EN, 'en', 'EN'],
            'rejection_reason' => [RejectionReasonEnum::class, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], ['BAD_PHOTO_QUALITY', 'FACE_NOT_DETECTED', 'VIOLATION_OF_INTERNAL_RULES', 'NSFW_CONTENT', 'GENERAL_REASON', 'USER_PROFILE_PHOTO_BAD_PHOTO_QUALITY', 'USER_PROFILE_PHOTO_FACE_NOT_DETECTED', 'USER_PROFILE_PHOTO_NSFW_CONTENT', 'FACE_FROM_VERIFICATION_PHOTO_NOT_FOUND', 'USER_PROFILE_PHOTO_FACE_FROM_VERIFICATION_PHOTO_NOT_FOUND', 'DECLINED_BY_ADMIN', 'USER_PROFILE_PHOTO_INTERNAL_ERROR', 'VIDEO_INAPPROPRIATE', 'NAME_INAPPROPRIATE', 'DESCRIPTION_INAPPROPRIATE', 'INSTAGRAM_INAPPROPRIATE', 'PROFILE_FULLY_REJECTED', 'MODERATION_IGNORED'], RejectionReasonEnum::BAD_PHOTO_QUALITY, 1, 'BAD_PHOTO_QUALITY'],
        ];
    }

    #[DataProvider('enumProvider')]
    public function test_enum_helpers_return_expected_values(
        string $enumClass,
        array $expectedValues,
        array $expectedNames,
        object $firstCase,
        int|string $validValue,
        string $validName
    ): void {
        $this->assertSame($expectedValues, $enumClass::values());
        $this->assertSame(array_map('strtolower', $expectedNames), $enumClass::names());
        $this->assertSame($firstCase, $enumClass::tryFrom($validValue));
        $this->assertSame($firstCase, $enumClass::tryFromName($validName));
        $this->assertSame(0, $enumClass::valueIndex($firstCase));
    }

    public function test_try_from_returns_null_for_invalid_value(): void
    {
        $this->assertNull(GenderEnum::tryFrom('unknown'));
    }

    public function test_try_from_name_returns_null_for_null_value(): void
    {
        $this->assertNull(GenderEnum::tryFromName(null));
    }

    public function test_try_from_name_throws_for_invalid_name(): void
    {
        $this->expectException(InvalidArgumentException::class);

        GenderEnum::tryFromName('unknown');
    }
}
