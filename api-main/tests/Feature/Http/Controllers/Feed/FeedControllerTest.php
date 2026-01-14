<?php

namespace Feature\Http\Controllers\Feed;

use App\Enums\Core\SwipeActionEnum;
use App\Events\Feed\MatchEvent;
use App\Models\User;
use App\Services\User\UserFeedProfileService;
use Database\Factories\User\UserFeedProfileFactory;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Event;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FeedControllerTest extends TestCase
{
    private const SWIPE_URI = '/api/feed/swipe';

    public function testSwipe()
    {
        /** @var UserFeedProfileService $feedService */
        $feedService = App::make(UserFeedProfileService::class);

        $firstProfileDto = UserFeedProfileFactory::makeDto();
        $firstProfileDto = $feedService->upsert($firstProfileDto);

        $user = User::query()->find($firstProfileDto->userId);
        Sanctum::actingAs($user);

        $secondProfileDto = UserFeedProfileFactory::makeDto();
        $secondProfileDto = $feedService->upsert($secondProfileDto);

        $response = $this->post(self::SWIPE_URI,[
            'profile_id' => $secondProfileDto->id,
            'action' => SwipeActionEnum::LIKE->value
        ]);

        $response->assertStatus(200);
    }

    public function testMutualSwipe()
    {
        Event::fake();

        /** @var UserFeedProfileService $feedService */
        $feedService = App::make(UserFeedProfileService::class);

        $firstProfileDto = UserFeedProfileFactory::makeDto();
        $firstProfileDto = $feedService->upsert($firstProfileDto);

        $user = User::query()->find($firstProfileDto->userId);
        Sanctum::actingAs($user);

        $secondProfileDto = UserFeedProfileFactory::makeDto();
        $secondProfileDto = $feedService->upsert($secondProfileDto);

        $response = $this->post(self::SWIPE_URI,[
            'profile_id' => $secondProfileDto->id,
            'action' => SwipeActionEnum::LIKE->value
        ]);
        $response->assertStatus(200);

        $user = User::query()->find($secondProfileDto->userId);
        Sanctum::actingAs($user);

        $response = $this->post(self::SWIPE_URI,[
            'profile_id' => $firstProfileDto->id,
            'action' => SwipeActionEnum::LIKE->value
        ]);
        $response->assertStatus(200);

        Event::assertDispatched(MatchEvent::class);
    }
}
