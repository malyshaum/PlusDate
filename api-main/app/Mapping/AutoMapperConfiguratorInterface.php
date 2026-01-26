<?php

namespace App\Mapping;

use AutoMapperPlus\Configuration\AutoMapperConfig;

interface AutoMapperConfiguratorInterface
{
    public function configure(AutoMapperConfig $config): void;
}
