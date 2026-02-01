<?php

namespace App\Services\Chat;

use App\Dto\Chat\ChatDto;
use App\Dto\Chat\ChatFilterDto;
use App\Dto\Chat\ChatMessageDto;
use App\Dto\Chat\CreateChatDto;
use App\Dto\Chat\SendMessageDto;
use App\Dto\CursorCollectionDto;
use App\Enums\Core\FileTypeEnum;
use App\Enums\Telegram\BotNotificationTypeEnum;
use App\Events\Chat\ChatCreatedEvent;
use App\Events\Chat\MessageReadEvent;
use App\Events\Chat\MessageSentEvent;
use App\Jobs\Notification\UserBotNotification;
use App\Mapping\Chat\ChatMapping;
use App\Mapping\CursorCollectionMapping;
use App\Models\Chat;
use App\Models\ChatMessage;
use App\Models\User;
use App\Models\User\UserFile;
use App\Services\User\FileService;
use AutoMapperPlus\AutoMapper;
use AutoMapperPlus\Exception\InvalidArgumentException;
use AutoMapperPlus\Exception\UnregisteredMappingException;
use Exception;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\Cursor;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

readonly class ChatService
{
    public function __construct(
        private AutoMapper $mapper,
    ) {
    }

    /**
     * @throws UnregisteredMappingException
     */
    public function createChat(CreateChatDto $dto): ChatDto
    {
        DB::beginTransaction();
        try {
            $lockKey = crc32(implode('-', [min($dto->userId, $dto->otherUserId), max($dto->userId, $dto->otherUserId)]));

            DB::select('SELECT pg_advisory_xact_lock(?)', [$lockKey]);

            $existingChat = Chat::query()
                ->select('chats.*')
                ->join('chat_users', 'chats.id', '=', 'chat_users.chat_id')
                ->whereIn('chat_users.user_id', [$dto->userId, $dto->otherUserId])
                ->groupBy('chats.id')
                ->having(DB::raw('COUNT(DISTINCT chat_users.user_id)'), '=', 2)
                ->first();

            if ($existingChat) {
                DB::commit();
                $existingChat->load(['users', 'latestMessage.sender']);
                return $this->mapper->map($existingChat->toArray(), ChatDto::class);
            }

            $chat = Chat::query()->create();
            $chat->users()->attach([
                $dto->userId => ['joined_at' => now()],
                $dto->otherUserId => ['joined_at' => now()],
            ]);

            $chat->load(['users', 'latestMessage.sender']);
            $chatDto = $this->mapper->map($chat->toArray(), ChatDto::class);

            ChatCreatedEvent::broadcast($chatDto, $dto->userId, $dto->otherUserId);

            DB::commit();
            return $chatDto;
        } catch (Exception $exception) {
            DB::rollBack();
            throw $exception;
        }
    }

    /**
     * @throws UnregisteredMappingException
     */
    public function sendMessage(SendMessageDto $dto): ChatMessageDto
    {
        DB::beginTransaction();
        try {
            $message = ChatMessage::query()->create([
                'chat_id' => $dto->chatId,
                'sender_id' => $dto->senderId,
                'message' => $dto->message,
                'sent_at' => Carbon::now(),
            ]);

            $message->chat->touch();
            DB::commit();
        } catch (Exception $exception) {
            DB::rollBack();
            throw $exception;
        }

        /** @see ChatMapping::arrayToChatMessageDto() */
        $messageDto = $this->mapper->map($message->toArray(), ChatMessageDto::class);

        MessageSentEvent::broadcast($messageDto);

        $userId = DB::table('chat_users')
            ->where('chat_id', $dto->chatId)
            ->where('user_id','!=', $dto->senderId)
            ->first()
            ->user_id;

        UserBotNotification::dispatch($userId, BotNotificationTypeEnum::MESSAGES, $dto->chatId);

        return $messageDto;
    }

    /**
     * @throws InvalidArgumentException
     * @throws UnregisteredMappingException
     */
    public function getUserChats(ChatFilterDto $filterDto): CursorCollectionDto
    {
        $pagination = Chat::query()
            ->select('chats.*')
            ->addSelect(DB::raw('(
                SELECT us.is_viewed FROM user_swipes us
                JOIN user_feed_profile ufp ON ufp.id = us.profile_id
                JOIN chat_users cu2 ON cu2.chat_id = chats.id AND cu2.user_id = ufp.user_id AND cu2.user_id != ' . $filterDto->userId . '
                WHERE us.user_id = ' . $filterDto->userId . '
                AND us.is_match = true
                AND us.deleted_at IS NULL
                LIMIT 1
            ) as is_viewed'))
            ->join('chat_users', function($join) use ($filterDto) {
                $join->on('chats.id', '=', 'chat_users.chat_id')
                    ->where('chat_users.user_id', $filterDto->userId);
            })
            ->whereHas('users', function ($query) use ($filterDto) {
                $query->where('users.id', '!=', $filterDto->userId)
                      ->whereNull('users.deleted_at')
                      ->where('blocked', false);
            })
            ->with([
                'users' => function ($query) {
                    $query->whereNull('users.deleted_at')
                          ->where('blocked', false);
                },
                'users.files' => function ($query) {
                    $query->where('is_under_moderation', false)
                        ->where('is_main', true)
                        ->whereDoesntHave('moderation')
                        ->where('type', FileTypeEnum::IMAGE);
                },
                'latestMessage'
            ])
            ->when($filterDto->hasMessages, function (Builder $query) {
                $query->whereHas('messages');
            })
            ->withCount(['messages as unread_count' => function ($query) use ($filterDto) {
                $query->where('sender_id', '!=', $filterDto->userId)->whereNull('read_at');
            }])
            ->orderBy('chats.updated_at', 'desc')
            ->cursorPaginate(perPage: 20, cursor: Cursor::fromEncoded($filterDto->cursor));

        /** @var CursorCollectionDto $collection */
        /** @see CursorCollectionMapping */
        $collection = $this->mapper->map($pagination, CursorCollectionDto::class);

        // TODO: refactor this, use mapping with proper dtos and stuff
        $collection->data = $collection->data->map(function ($chat) use ($filterDto) {
            $chatArray = $chat->toArray();
            $chatArray['users'] = collect($chatArray['users'])->map(function ($user) use ($filterDto) {
                if ($user['id'] === $filterDto->userId) {
                    return $user;
                }
                $user['files'] = collect($user['files'])->map(function ($file) {
                    $filename = FileService::PREFIX_MINI . basename($file['filepath']);
                    $file['url'] = Storage::temporaryUrl(
                        Str::replace(basename($file['filepath']), $filename, $file['filepath']),
                        Carbon::now()->addDay()
                    );
                    return $file;
                })->toArray();
                return $user;
            })->toArray();
            return $chatArray;
        });

        return $collection;
    }

    /**
     * @throws UnregisteredMappingException
     */
    public function getChatMessages(int $chatId, int $userId, string|null $cursor, int $perPage = 20): CursorCollectionDto
    {
        $manualPrevCursor = null;
        $query = ChatMessage::query()->where('chat_id', $chatId);

        $query->orderBy('id', 'asc');

        if ($cursor === null) {
            $firstUnread = ChatMessage::query()
                ->where('chat_id', $chatId)
                ->where('sender_id', '!=', $userId)
                ->whereNull('read_at')
                ->orderBy('id', 'asc')
                ->first();

            if ($firstUnread) {
                $perPage += 10;

                $contextMessage = ChatMessage::query()
                    ->where('chat_id', $chatId)
                    ->where('id', '<', $firstUnread->id)
                    ->orderBy('id', 'desc')
                    ->skip(9)
                    ->first();

                if ($contextMessage) {
                    $query->where('id', '>=', $contextMessage->id);
                    $manualPrevCursor = new Cursor(['id' => $contextMessage->id], false);
                }
            } else {
                $latestPageStart = ChatMessage::query()
                    ->where('chat_id', $chatId)
                    ->orderBy('id', 'desc')
                    ->take($perPage)
                    ->get()
                    ->last();

                if ($latestPageStart) {
                    $query->where('id', '>=', $latestPageStart->id);
                    $manualPrevCursor = new Cursor(['id' => $latestPageStart->id], false);
                }
            }

            $pagination = $query->cursorPaginate(perPage: $perPage);
        } else {
            $pagination = $query->cursorPaginate(perPage: $perPage, cursor: Cursor::fromEncoded($cursor));
        }

        /** @var CursorCollectionDto $dto */
        $paginationDto = $this->mapper->map($pagination, CursorCollectionDto::class);

        if ($manualPrevCursor !== null) {
            $paginationDto->prevCursor = $manualPrevCursor->encode();
        }

        return $paginationDto;
    }

    public function markMessagesRead(int $messageId, int $userId): bool
    {
        $message = ChatMessage::query()->find($messageId);

        ChatMessage::query()
            ->whereHas('chat.users', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->where('chat_id', $message->chat_id)
            ->where('sender_id', '!=', $userId)
            ->where('read_at', null)
            ->whereDate('created_at', '<=', $message->created_at)
            ->update(['read_at' => Carbon::now()]);

        MessageReadEvent::broadcast($message->id, $message->sender_id, $message->chat_id);

        return true;
    }

    /**
     * @throws UnregisteredMappingException
     */
    public function userRecentChats(int $userId, string|null $cursor): CursorCollectionDto
    {
        $chats = Chat::query()
            ->select(['chats.id', 'chats.created_at'])
            ->selectSub(
                ChatMessage::query()
                    ->select('message')
                    ->whereColumn('chat_id', 'chats.id')
                    ->latest()
                    ->limit(1),
                'last_message'
            )
            ->selectSub(
                UserFile::query()
                    ->select('filepath')
                    ->whereColumn('user_id', 'users.id')
                    ->where('is_main', true)
                    ->where('is_under_moderation', false)
                    ->whereDoesntHave('moderation')
                    ->where('type', FileTypeEnum::IMAGE)
                    ->latest()
                    ->limit(1),
                'filepath'
            )
            ->whereHas('users', function($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->join('chat_users', 'chats.id', '=', 'chat_users.chat_id')
            ->join('users', function($join) use ($userId) {
                $join->on('chat_users.user_id', '=', 'users.id')
                    ->where('users.id', '!=', $userId)
                    ->where('users.deleted_at', '=', null)
                    ->where('users.blocked', false);
            })
            ->addSelect(['users.id as user_id', 'users.name as user_name', 'users.last_active_at'])
            ->addSelect(DB::raw('(
                SELECT us.is_viewed FROM user_swipes us
                JOIN user_feed_profile ufp ON ufp.id = us.profile_id
                WHERE us.user_id = ' . $userId . '
                AND ufp.user_id = users.id
                AND us.is_match = true
                AND us.deleted_at IS NULL
                LIMIT 1
            ) as is_viewed'))
            ->orderBy('chats.created_at', 'desc')
            ->groupBy('chats.id', 'chats.created_at', 'users.id', 'users.name', 'users.last_active_at')
            ->cursorPaginate(perPage: 20, cursor: Cursor::fromEncoded($cursor));

        /** @var CursorCollectionDto $dto */
        /** @see CursorCollectionMapping */
        $dto = $this->mapper->map($chats, CursorCollectionDto::class);

        $dto->data = $dto->data->map(function ($chat) use ($userId) {
            if ($chat->filepath) {
                $filename = FileService::PREFIX_MINI.basename($chat->filepath);
                $filepath = Str::replace(basename($chat->filepath), $filename, $chat->filepath);
                $chat->url = Storage::temporaryUrl($filepath, Carbon::now()->addDay());
            }
            return $chat;
        });

        return $dto;
    }

    /**
     * @throws UnregisteredMappingException
     */
    public function getChatsWithUnreadMessages(int $userId, string|null $cursor = null): CursorCollectionDto
    {
        $chats = Chat::query()
            ->whereHas('users', fn(Builder $query) => $query->where('users.id', $userId)->whereNull('users.deleted_at'))
            ->whereHas('messages', function (Builder $query) use ($userId) {
                $query->where('read_at', null)
                    ->where('sender_id', '!=', $userId)
                    ->latest()
                    ->limit(1);
            })
            ->cursorPaginate(perPage: 20, cursor: Cursor::fromEncoded($cursor));

        /** @see CursorCollectionMapping */
        return $this->mapper->map($chats, CursorCollectionDto::class);
    }

    /**
     * @throws Exception
     */
    public function createServiceMessage(int $chatId, int $userId): void
    {
        $user = User::query()->find($userId);
        $locale = $user?->language_code ?? 'en';
        $messageText = Lang::get('chat.service_message.new_match', locale: $locale);

        $existingServiceMessage = ChatMessage::query()
            ->where('chat_id', $chatId)
            ->whereNull('sender_id')
            ->where('message', $messageText)
            ->first();

        if ($existingServiceMessage !== null) {
            if ($existingServiceMessage->read_at === null) {
                return;
            }
            $existingServiceMessage->read_at = null;
            $existingServiceMessage->save();
            return;
        }

        DB::beginTransaction();
        try {
            ChatMessage::query()->create([
                'chat_id' => $chatId,
                'sender_id' => null,
                'message' => $messageText,
                'sent_at' => Carbon::now(),
                'read_at' => null,
            ]);

            DB::commit();
        } catch (Exception $exception) {
            DB::rollBack();
            throw $exception;
        }
    }
}
