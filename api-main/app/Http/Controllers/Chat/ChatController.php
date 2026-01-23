<?php

namespace App\Http\Controllers\Chat;

use App\Dto\Chat\ChatFilterDto;
use App\Dto\Chat\CreateChatDto;
use App\Dto\Chat\SendMessageDto;
use App\Http\Controllers\Controller;
use App\Http\Requests\Chat\CreateChatRequest;
use App\Http\Requests\Chat\GetChatMessagesRequest;
use App\Http\Requests\Chat\GetChatRequest;
use App\Http\Requests\Chat\MarkMessageReadRequest;
use App\Http\Requests\Chat\SendMessageRequest;
use App\Http\Resources\Chat\ChatResource;
use App\Mapping\Chat\ChatMapping;
use App\Services\Chat\ChatService;
use AutoMapperPlus\AutoMapper;
use AutoMapperPlus\Exception\InvalidArgumentException;
use AutoMapperPlus\Exception\UnregisteredMappingException;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    public function __construct(
        private readonly AutoMapper $mapper,
        private readonly ChatService $chatService,
    ) {
    }

    /**
     * @throws UnregisteredMappingException
     * @throws Exception
     */
    public function createChat(CreateChatRequest $request): ChatResource
    {
        $dto = $this->mapper->map($request->validated(), CreateChatDto::class);
        $dto->userId = Auth::id();

        $chatDto = $this->chatService->createChat($dto);

        return ChatResource::make($chatDto);
    }

    /**
     * @throws UnregisteredMappingException
     * @throws InvalidArgumentException
     */
    public function getUserChats(GetChatRequest $request): Response|JsonResponse
    {
        /** @see ChatMapping::arrayToChatFilterDto */
        $filterDto = $this->mapper->map($request->validated(), ChatFilterDto::class);

        $pagination = $this->chatService->getUserChats($filterDto);

        return $this->response($pagination);
    }

    /**
     * @throws UnregisteredMappingException
     */
    public function getChatMessages(GetChatMessagesRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $pagination = $this->chatService->getChatMessages(
            $validated['chat_id'],
            $validated['user_id'],
            $validated['cursor'] ?? null,
            $validated['per_page'] ?? 20
        );

        return $this->response($pagination);
    }

    /**
     * @throws UnregisteredMappingException
     * @throws Exception
     */
    public function sendMessage(SendMessageRequest $request): Response|JsonResponse
    {
        /** @see ChatMapping::arrayToSendMessageDto */
        $dto = $this->mapper->map($request->validated(), SendMessageDto::class);

        $messageDto = $this->chatService->sendMessage($dto);

        return $this->response($messageDto);
    }

    public function markMessageRead(MarkMessageReadRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $success = $this->chatService->markMessagesRead(
            $validated['message_id'],
            $validated['user_id']
        );

        return $this->response(['success' => $success]);
    }

    public function getRecentChats(Request $request): JsonResponse
    {
        return $this->response(
            $this->chatService->userRecentChats(Auth::id(), $request->input('cursor'))
        );
    }
}
