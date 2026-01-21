<?php

namespace App\Events\Chat;

use App\Dto\Chat\ChatDto;
use App\Events\BroadcastsViaCentrifugoTrait;
use App\Services\User\FileService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ChatCreatedEvent
{
    use BroadcastsViaCentrifugoTrait;

    public function __construct(
        private readonly ChatDto $chatDto,
        private readonly int $userId,
        private readonly int $otherUserId,
    ) {}

    public function broadcastOn(): array
    {
        return [
            '#' . $this->userId,
            '#' . $this->otherUserId,
        ];
    }

    public function broadcastAs(): string
    {
        return 'chat.created';
    }

    public function broadcastWith(): array
    {
        $chatData = $this->chatDto->toArray();

        $chatData['users'] = collect($chatData['users'])->map(function ($user) {
            if (isset($user['files'])) {
                $user['files'] = collect($user['files'])->map(function ($file) {
                    $filename = FileService::PREFIX_MINI . basename($file['filepath']);
                    $file['url'] = Storage::temporaryUrl(
                        Str::replace(basename($file['filepath']), $filename, $file['filepath']),
                        Carbon::now()->addDay()
                    );
                    return $file;
                })->toArray();
            }
            return $user;
        })->toArray();

        return [
            'chat' => $chatData,
            'timestamp' => Carbon::now(),
        ];
    }
}
