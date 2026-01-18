<?php

declare(strict_types=1);

namespace App\Core\Extend;

use AutoMapperPlus\Configuration\Mapping as BaseMapping;

class Mapping extends BaseMapping
{
    public function useAwareCustomMapper(string $mapper): void
    {
        $this->getOptions()->setAwareCustomMapper($mapper);
    }
}
