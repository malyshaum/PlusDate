<?php

namespace App\Http\Controllers\Feed;

use App\Dto\Feed\SwipeDto;
use App\Dto\Feed\UserFeedProfilesFilterDto;
use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Feed\GetFeedProfilesRequest;
use App\Http\Requests\Feed\MarkMatchViewedRequest;
use App\Http\Requests\Feed\RespondToLikeRequest;
use App\Http\Requests\Feed\RollbackSwipeRequest;
use App\Http\Requests\Feed\SwipeProfileRequest;
use App\Http\Resources\Feed\FeedProfileResource;
use App\Models\User;
use App\Models\User\UserFeedProfile;
use App\Services\User\SwipeLimitService;
use App\Services\User\UserFeedProfileService;
use App\Services\User\UserSwipeService;
use AutoMapperPlus\AutoMapper;
use AutoMapperPlus\Exception\UnregisteredMappingException;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\Feed\DeleteMatchRequest;

class FeedController extends Controller
{
    public function __construct(
        private readonly AutoMapper             $autoMapper,
        private readonly UserFeedProfileService $userFeedProfileService,
        private readonly UserSwipeService       $userSwipeService,
        private readonly SwipeLimitService      $swipeLimitService,
    )
    {

    }

    /**
     * @throws UnregisteredMappingException|ApiException
     */
    public function profiles(GetFeedProfilesRequest $feedProfilesRequest): JsonResponse
    {
        /** @see FeedMapping::configureGetFeedProfilesRequestToUserFeedProfilesFilterDto() */
        $requestDto = $this->autoMapper->map($feedProfilesRequest, UserFeedProfilesFilterDto::class);

        /** @var User $user */
        $user = Auth::user();
        $gender = UserFeedProfile::query()
            ->select('sex')
            ->where('user_id', $user->id)
            ->value('sex');

        $swipeData = $this->swipeLimitService->getAvailableSwipes($user->id, $user->is_premium, $gender);
        request()->attributes->set('is_on_cooldown', $swipeData['is_on_cooldown'] ?? false);

        $pagination = $this->userFeedProfileService->get($requestDto);

        return response()->json([
            'data' => FeedProfileResource::collection($pagination['data']),
            'meta' => [
                'has_more' => $pagination['has_more'],
                'next_cursor' => $pagination['next_cursor'],
            ]
        ]);
    }

    /**
     * @throws UnregisteredMappingException
     * @throws Exception
     */
    public function swipe(SwipeProfileRequest $swipeRequest): JsonResponse
    {
        /** @see FeedMapping::configureSwipeProfileRequestToSwipeDto() */
        $swipeDto = $this->autoMapper->map($swipeRequest, SwipeDto::class);
        $swipeResultDto = $this->userSwipeService->recordSwipe($swipeDto);

        return $this->response($swipeResultDto);
    }

    public function revertSwipe(RollbackSwipeRequest $rollbackSwipeRequest): JsonResponse
    {
        $this->userSwipeService->revertSwipe($rollbackSwipeRequest->validated('swipe_id'));
        return $this->response();
    }

    /**
     * @throws Exception
     */
    public function deleteMatch(DeleteMatchRequest $deleteMatchRequest): JsonResponse
    {
        $this->userSwipeService->deleteMatch(
            $deleteMatchRequest->validated('user_id'),
            $deleteMatchRequest->validated('profile_id')
        );

        return $this->response();
    }

    public function markMatchViewed(MarkMatchViewedRequest $request): JsonResponse
    {
        $this->userSwipeService->markMatchViewed(
            $request->validated('user_id'),
            $request->validated('profile_id')
        );

        return $this->response();
    }

    /**
     * @throws UnregisteredMappingException
     * @throws Exception
     */
    public function respond(RespondToLikeRequest $respondToLikeRequest): JsonResponse
    {
        /** @see FeedMapping::configureSwipeProfileRequestToSwipeDto() */
        $swipeDto = $this->autoMapper->map($respondToLikeRequest, SwipeDto::class);

        $swipeResultDto = $this->userSwipeService->recordSwipe($swipeDto);

        return $this->response($swipeResultDto);
    }
}
