<?php

declare(strict_types=1);

namespace App\Core\Extend;

use AutoMapperPlus\Configuration\Options as BaseOptions;
use AutoMapperPlus\MapperInterface;

class Options extends BaseOptions
{
    protected string|null $customMapperClass = null;

    public function setAwareCustomMapper(string $mapper): void
    {
        $this->customMapperClass = $mapper;
    }

    public function providesCustomMapper(): bool
    {
        return parent::providesCustomMapper() || $this->customMapperClass !== null;
    }

    public function getCustomMapper(): MapperInterface|null
    {
        if (parent::providesCustomMapper()) {
            return parent::getCustomMapper();
        }

        if ($this->customMapperClass) {
            return app()->make($this->customMapperClass);
        }

        return null;
    }
}
