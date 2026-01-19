<?php

namespace App\Dto;

use Illuminate\Support\Collection;

class CursorCollectionDto extends BaseDto
{
    public Collection $data;

    public string|null $cursor = null;
    public string|null $nextCursor = null;
    public string|null $prevCursor = null;
    public bool $hasMore = false;
    public int $total = 0;

    public function toArray(): array
    {
        return [
            'data' => $this->data->toArray(),
            'meta' => [
                'cursor' => $this->cursor,
                'next_cursor' => $this->nextCursor,
                'prev_cursor' => $this->prevCursor,
                'has_more' => $this->hasMore,
                'total' => $this->total,
            ]
        ];
    }
}
