<?php

namespace App\Events\Feed;

use App\Events\BroadcastsViaCentrifugoTrait;
use App\Services\User\FileService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MatchEvent
{
    use BroadcastsViaCentrifugoTrait;

    public function __construct(
        private readonly int $userId,
        private readonly int $chatId,
        private readonly int $matchId,
        private readonly string|null $filepath,
    ) {}

    public function broadcastOn(): array
    {
        return ['#' . $this->userId];
    }

    public function broadcastAs(): string
    {
        return 'user.match';
    }

    public function broadcastWith(): array
    {
        return [
            'chat_id' => $this->chatId,
            'user_id' => $this->matchId,
            'photo_url' => $this->filepath ? Storage::temporaryUrl(
                Str::replace(basename($this->filepath), FileService::PREFIX_MINI . basename($this->filepath), $this->filepath),
                Carbon::now()->addDay()
            ) : null,
        ];
    }
}
