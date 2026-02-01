<?php

namespace App\Services\User;

use App\Dto\Chat\CreateChatDto;
use App\Dto\Feed\SwipeDto;
use App\Dto\Feed\SwipeResultDto;
use App\Dto\User\UserDto;
use App\Enums\Core\FileTypeEnum;
use App\Enums\Core\SwipeActionEnum;
use App\Enums\Telegram\BotNotificationTypeEnum;
use App\Events\Feed\LikeEvent;
use App\Events\Feed\MatchDeletedEvent;
use App\Events\Feed\MatchEvent;
use App\Jobs\Notification\UserBotNotification;
use App\Models\User;
use App\Models\User\UserFeedProfile;
use App\Models\User\UserFile;
use App\Models\User\UserSwipe;
use App\Services\Chat\ChatService;
use App\Services\Notification\NotificationService;
use AutoMapperPlus\AutoMapper;
use AutoMapperPlus\Exception\UnregisteredMappingException;
use Exception;
use Illuminate\Support\Facades\DB;
use App\Models\Chat;
use App\Models\ChatMessage;

readonly class UserSwipeService
{
    public function __construct(
        private AutoMapper         $mapper,
        private ChatService        $chatService,
        private SwipeLimitService  $swipeLimitService,
    )
    {

    }

    /**
     * @throws Exception
     */
    public function recordSwipe(SwipeDto $dto): SwipeResultDto
    {
        $user = User::query()
            ->select(['id','is_onboarded','is_under_moderation'])
            ->where('id', $dto->userId)
            ->firstOrFail();

        DB::beginTransaction();
        try {
            $swipe = UserSwipe::query()->updateOrCreate([
                'user_id' => $dto->userId,
                'profile_id' => $dto->profileId,
            ], [
                'action' => $dto->action,
            ]);

            if ($dto->isRespond) {
                $swipe->update(['is_respond' => true]);
            } else {
                $this->swipeLimitService->recordSwipeUsage($dto->userId, $dto->action);
            }

            $feedProfileUserId = UserFeedProfile::query()
                ->select('user_id')
                ->where('id', $dto->profileId)
                ->first()
                ->user_id;

            $dto->id = $swipe->id;
            DB::commit();
        } catch (Exception $exception) {
            DB::rollBack();
            throw $exception;
        }

        $swipeResult = $this->getSwipeResult($dto);

        if ($swipeResult->matched === false
            && $user->is_onboarded === true
            && $user->is_under_moderation === false
            && $dto->action !== SwipeActionEnum::DISLIKE
        ) {
            LikeEvent::broadcast($feedProfileUserId);
            UserBotNotification::dispatch($feedProfileUserId, BotNotificationTypeEnum::LIKES);
        }

        return $swipeResult;
    }

    public function markMatchViewed(int $userId, int $profileId): void
    {
        $feedProfile = UserFeedProfile::query()
            ->select('id')
            ->where('user_id', $profileId)
            ->firstOrFail();

        UserSwipe::query()
            ->where('user_id', $userId)
            ->where('profile_id', $feedProfile->id)
            ->where('is_match', true)
            ->update(['is_viewed' => true]);
    }

    public function revertSwipe(int $swipeId): void
    {
        UserSwipe::query()
            ->where('id', $swipeId)
            ->where('action', SwipeActionEnum::DISLIKE)
            ->delete();
    }

    /**
     * @throws Exception
     */
    public function deleteMatch(int $userId, int $profileId): void
    {
        DB::beginTransaction();
        try {
            $secondUser = UserFeedProfile::query()->find($profileId)->user;

            $currentUserChats = DB::table('chat_users')
                ->select('chat_id')
                ->where('user_id', $userId)
                ->pluck('chat_id')
                ->toArray();

            $secondUserChats = DB::table('chat_users')
                ->select('chat_id')
                ->where('user_id', $secondUser->id)
                ->pluck('chat_id')
                ->toArray();

            $chatsIds = array_intersect($currentUserChats, $secondUserChats);

            Chat::query()
                ->whereIn('id', $chatsIds)
                ->delete();

            ChatMessage::query()
                ->whereIn('chat_id', $chatsIds)
                ->delete();

            DB::table('chat_users')
                ->whereIn('chat_id', $chatsIds)
                ->delete();

            /** @var UserFeedProfile $currentUserProfile */
            $currentUserProfile = UserFeedProfile::query()
                ->select('id')
                ->where('user_id', $userId)
                ->firstOrFail();

            UserSwipe::query()
                ->whereIn('user_id', [$userId, $secondUser->id])
                ->whereIn('profile_id', [$profileId, $currentUserProfile->id])
                ->delete();

            DB::commit();

            MatchDeletedEvent::broadcast($secondUser->id, $userId);
        } catch (Exception $exception) {
            DB::rollBack();
            throw $exception;
        }
    }

    /**
     * @throws UnregisteredMappingException
     */
    public function getSwipeResult(SwipeDto $swipeDto): SwipeResultDto
    {
        $swipeResult = new SwipeResultDto();
        $swipeResult->swipeId = $swipeDto->id;
        $swipeResult->matched = false;
        $swipeResult->user = null;
        $swipeResult->chat = null;

        if ($swipeDto->action === SwipeActionEnum::DISLIKE) {
            return $swipeResult;
        }

        $currentUserProfileId = UserFeedProfile::query()
            ->select('id')
            ->where('user_id', $swipeDto->userId)
            ->first()
            ->id;

        $likedProfileUserId = UserFeedProfile::query()
            ->select('user_id')
            ->find($swipeDto->profileId)
            ->user_id;

        /** @var UserSwipe $anotherUserLike */
        $anotherUserLike = UserSwipe::query()
            ->select(['id','action'])
            ->where('user_id', $likedProfileUserId)
            ->where('profile_id', $currentUserProfileId)
            ->whereIn('action', [SwipeActionEnum::LIKE, SwipeActionEnum::SUPERLIKE])
            ->first();

        if ($anotherUserLike !== null && in_array($anotherUserLike->action, [SwipeActionEnum::LIKE->value, SwipeActionEnum::SUPERLIKE->value])) {

            /** @var User $user */
            $user = User::query()
                ->with(['feedProfile', 'validFiles'])
                ->where('id', $likedProfileUserId)
                ->first();

            $createDto = new CreateChatDto();
            $createDto->userId = $swipeDto->userId;
            $createDto->otherUserId = $likedProfileUserId;
            $chatDto = $this->chatService->createChat($createDto);

            /** @see  UserToUserDtoMapper::mapToObject */
            $swipeResult->user = $this->mapper->map($user,UserDto::class);
            $swipeResult->matched = true;
            $swipeResult->chat = $chatDto;

            $mainPhoto = UserFile::query()
                ->where('user_id', $swipeDto->userId)
                ->where('type', FileTypeEnum::IMAGE)
                ->whereDoesntHave('moderation')
                ->where('is_main', true)
                ->first();

            UserSwipe::query()
                ->whereIn('id', [$swipeDto->id, $anotherUserLike->id])
                ->update(['is_match' => true]);

            MatchEvent::broadcast($likedProfileUserId, $chatDto->id, $swipeDto->userId, $mainPhoto?->filepath);
            UserBotNotification::dispatch($createDto->otherUserId, BotNotificationTypeEnum::MATCHES);
        }

        return $swipeResult;
    }
}
