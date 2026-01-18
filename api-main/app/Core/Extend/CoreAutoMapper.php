<?php

declare(strict_types=1);

namespace App\Core\Extend;

use App\Enums\Core\TagEnum;
use AutoMapperPlus\AutoMapper;
use AutoMapperPlus\Configuration\MappingInterface;
use Illuminate\Container\RewindableGenerator;

final class CoreAutoMapper extends AutoMapper
{
    private bool $configNeed = true;

    protected function getMapping(string $sourceClass, string $destinationClass): MappingInterface
    {
        if ($this->configNeed) {
            $this->configNeed = false;

            $config = $this->getConfiguration();

            /** @var RewindableGenerator $mappings */
            $mappings = app()->tagged(TagEnum::MAPPINGS->name);

            foreach ($mappings as $mapping) {
                $mapping->configure($config);
            }
        }

        return parent::getMapping($sourceClass, $destinationClass);
    }
}
