<?php

namespace App\Mapping;

use App\Dto\CursorCollectionDto;
use AutoMapperPlus\Configuration\AutoMapperConfig;
use Illuminate\Contracts\Pagination\CursorPaginator;

class CursorCollectionMapping  implements AutoMapperConfiguratorInterface
{
    public function configure(AutoMapperConfig $config): void
    {
        $config->registerMapping(CursorPaginator::class, CursorCollectionDto::class)
            ->forMember('data', fn(CursorPaginator $paginator) => collect($paginator->items()))
            ->forMember('cursor', fn(CursorPaginator $paginator) => $paginator->cursor()?->encode())
            ->forMember('nextCursor', fn(CursorPaginator $paginator) => $paginator->nextCursor()?->encode())
            ->forMember('prevCursor', fn(CursorPaginator $paginator) => $paginator->previousCursor()?->encode())
            ->forMember('hasMore', fn(CursorPaginator $paginator) => $paginator->hasMorePages())
            ->forMember('total', fn(CursorPaginator $paginator) => count($paginator->items()));
    }
}
