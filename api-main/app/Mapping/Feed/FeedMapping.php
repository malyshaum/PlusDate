<?php

namespace App\Mapping\Feed;

use App\Dto\Feed\SwipeDto;
use App\Dto\Feed\UserFeedProfilesFilterDto;
use App\Enums\Core\SwipeActionEnum;
use App\Http\Requests\Feed\GetFeedProfilesRequest;
use App\Http\Requests\Feed\RespondToLikeRequest;
use App\Http\Requests\Feed\SwipeProfileRequest;
use App\Mapping\AutoMapperConfiguratorInterface;
use AutoMapperPlus\Configuration\AutoMapperConfig;

class FeedMapping implements AutoMapperConfiguratorInterface
{

    public function configure(AutoMapperConfig $config): void
    {
        $this->configureGetFeedProfilesRequestToUserFeedProfilesFilterDto($config);
        $this->configureSwipeProfileRequestToSwipeDto($config);
    }

    private function configureGetFeedProfilesRequestToUserFeedProfilesFilterDto(AutoMapperConfig $config): void
    {
        $config->registerMapping(GetFeedProfilesRequest::class, UserFeedProfilesFilterDto::class)
            ->forMember('cursor', fn(GetFeedProfilesRequest $request) => $request->input('cursor'))
            ->forMember('perPage', fn(GetFeedProfilesRequest $request) => $request->input('per_page', 10))
            ->forMember('userId', fn(GetFeedProfilesRequest $request) => $request->validated('user_id'))
            ->forMember('skipFilter', fn(GetFeedProfilesRequest $request) => (bool)$request->validated('skip_filter', false));
    }

    private function configureSwipeProfileRequestToSwipeDto(AutoMapperConfig $config): void
    {
        $config->registerMapping(SwipeProfileRequest::class, SwipeDto::class)
            ->forMember('userId', fn(SwipeProfileRequest $request) => $request->validated('user_id'))
            ->forMember('profileId', fn(SwipeProfileRequest $request) => $request->validated('profile_id'))
            ->forMember('action', fn(SwipeProfileRequest $request) => SwipeActionEnum::from($request->input('action')));

        $config->registerMapping(RespondToLikeRequest::class, SwipeDto::class)
            ->forMember('userId', fn(RespondToLikeRequest $request) => $request->validated('user_id'))
            ->forMember('profileId', fn(RespondToLikeRequest $request) => $request->validated('profile_id'))
            ->forMember('action', fn(RespondToLikeRequest $request) => SwipeActionEnum::from($request->input('action')))
            ->forMember('isRespond', fn(RespondToLikeRequest $request) => true);
    }
}
