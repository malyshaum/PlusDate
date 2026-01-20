<?php

namespace App\Enums;

use InvalidArgumentException;

trait BaseEnumTrait
{
    public static function names(): array
    {
        $names = array_column(self::cases(), 'name');
        return array_map(fn($name) => strtolower($name), $names);
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function tryFrom(null|int|string $value): ?self
    {
        if ($value === null) {
            return null;
        }

        foreach (self::cases() as $case) {
            if ($case->value === $value) {
                return $case;
            }
        }

        throw new InvalidArgumentException("Invalid enum case value: $value");
    }

    public static function tryFromName(?string $value): ?self
    {
        if ($value === null) {
            return null;
        }

        foreach (self::cases() as $case) {
            if (strtolower($case->name) === strtolower($value)) {
                return $case;
            }
        }

        throw new InvalidArgumentException("Invalid enum case name: $value");
    }

    public static function valueIndex(self $enum): int
    {
        $values = self::values();
        return array_search($enum->value, $values) ?? throw new InvalidArgumentException("invalid enum case value: $enum->value");
    }
}
