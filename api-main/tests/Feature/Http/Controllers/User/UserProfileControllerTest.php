<?php

namespace Tests\Feature\Http\Controllers\User;

use App\Enums\Core\EyeColorEnum;
use App\Enums\Core\GenderEnum;
use App\Enums\Core\SearchForEnum;
use App\Models\User;
use App\Services\User\UserFeedProfileService;
use Database\Factories\User\UserFeedProfileFactory;
use Illuminate\Support\Facades\App;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserProfileControllerTest extends TestCase
{
    public function test_updatePreferences_creates_new_search_preference(): void
    {
        /** @var User $user */
        $user = User::factory()->create();

        $requestData = [
            'include_nearby' => true,
            'from_age' => 18,
            'to_age' => 30,
            'expand_age_range' => false,
            'gender' => GenderEnum::FEMALE->value,
            'search_for' => SearchForEnum::RELATIONS->value,
            'eye_color' => [EyeColorEnum::GREEN->value],
            'height' => 170,
            'hobbies' => [1, 2, 3],
            'with_video' => true,
            'with_premium' => false
        ];

        $response = $this->actingAs($user)
            ->putJson('/api/user/search/preferences', $requestData);

        $response->assertStatus(200);

        $data = $response->json();
        $this->assertEquals($user->id, $data['user_id']);
        $this->assertEquals(18, $data['from_age']);
        $this->assertEquals(30, $data['to_age']);
        $this->assertEquals(GenderEnum::FEMALE->value, $data['gender']);
        $this->assertTrue($data['include_nearby']);
        $this->assertTrue($data['with_video']);
        $this->assertFalse($data['with_premium']);
    }

    public function test_updatePreferences_updates_existing_preference_via_api(): void
    {
        /** @var User $user */
        $user = User::factory()->create();

        $this->actingAs($user)
            ->putJson('/api/user/search/preferences', [
                'from_age' => 20,
                'to_age' => 25,
                'gender' => GenderEnum::MALE->value
            ]);

        $response = $this->actingAs($user)
            ->putJson('/api/user/search/preferences', [
                'from_age' => 22,
                'gender' => GenderEnum::FEMALE->value,
                'with_video' => true
            ]);

        $response->assertStatus(200);

        $data = $response->json();
        $this->assertEquals($user->id, $data['user_id']);
        $this->assertEquals(22, $data['from_age']);
        $this->assertEquals(25, $data['to_age']);
        $this->assertEquals(GenderEnum::FEMALE->value, $data['gender']);
        $this->assertTrue($data['with_video']);
    }

    public function test_updatePreferences_validation_errors(): void
    {
        /** @var User $user */
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->putJson('/api/user/search/preferences', [
                'from_age' => 15,
                'to_age' => 101,
                'gender' => 'invalid_gender',
                'search_for' => 999,
                'eye_color' => 'invalid_color',
                'city_id' => 99999,
                'activity_id' => 99999,
                'include_nearby' => 'not_boolean'
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors([
            'from_age',
            'to_age',
            'gender',
            'search_for',
            'eye_color',
            'city_id',
            'activity_id',
            'include_nearby'
        ]);
    }

    public function test_updatePreferences_requires_authentication(): void
    {
        $response = $this->putJson('/api/user/search/preferences', [
            'from_age' => 18,
            'to_age' => 30
        ]);

        $response->assertStatus(401);
    }

    public function test_updatePreferences_returns_correct_json_structure(): void
    {
        /** @var User $user */
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->putJson('/api/user/search/preferences', [
                'from_age' => 20,
                'to_age' => 28,
                'gender' => GenderEnum::MALE->value,
                'include_nearby' => true
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                    'user_id',
                    'include_nearby',
                    'from_age',
                    'to_age',
                    'gender'
            ]);

        $data = $response->json();
        $this->assertEquals($user->id, $data['user_id']);
        $this->assertTrue($data['include_nearby']);
    }

    public function test_updatePreferences_handles_hobbies_array(): void
    {
        /** @var User $user */
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->putJson('/api/user/search/preferences', [
                'hobbies' => [1, 2, 3, 4, 5]
            ]);

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertEquals([1, 2, 3, 4, 5], $data['hobbies']);
    }

    public function test_complete_workflow_create_then_update_via_api(): void
    {
        /** @var User $user */
        $user = User::factory()->create();

        $createResponse = $this->actingAs($user)
            ->putJson('/api/user/search/preferences', [
                'from_age' => 18,
                'to_age' => 25,
                'gender' => GenderEnum::MALE->value,
                'include_nearby' => false
            ]);

        $createResponse->assertStatus(200);

        $updateResponse = $this->actingAs($user)
            ->putJson('/api/user/search/preferences', [
                'from_age' => 21,
                'include_nearby' => true,
                'with_video' => true
            ]);

        $updateResponse->assertStatus(200);

        $data = $updateResponse->json();
        $this->assertEquals($user->id, $data['user_id']);
        $this->assertEquals(21, $data['fromAge']);
        $this->assertEquals(25, $data['toAge']);
        $this->assertTrue($data['includeNearby']);
        $this->assertTrue($data['withVideo']);
    }

    public function testMe()
    {
        /** @var UserFeedProfileService $feedService */
        $feedService = App::make(UserFeedProfileService::class);

        $profileDto = UserFeedProfileFactory::makeDto();
        $profileDto = $feedService->upsert($profileDto);

        $user = User::query()->find($profileDto->userId);
        Sanctum::actingAs($user);

        $response = $this->get('/api/user/me');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'id',
            'telegram_id',
            'first_name',
            'last_name',
            'username',
            'birth_date',
            'email',
            'phone',
            'bio',
            'is_under_moderation',
            'created_at',
            'updated_at'
        ]);
    }

    public function testUpsert()
    {
        /** @var UserFeedProfileService $feedService */
        $feedService = App::make(UserFeedProfileService::class);

        $profileDto = UserFeedProfileFactory::makeDto();
        $profileDto = $feedService->upsert($profileDto);

        $user = User::query()->find($profileDto->userId);
        Sanctum::actingAs($user);

        $updateData = [
            'id' => $user->id,
            'first_name' => 'Updated Name',
            'bio' => 'Updated bio text'
        ];

        $response = $this->put('/api/user/profile', $updateData);

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'first_name' => 'Updated Name',
            'bio' => 'Updated bio text'
        ]);
    }

    public function testGetLikes()
    {
        /** @var UserFeedProfileService $feedService */
        $feedService = App::make(UserFeedProfileService::class);

        $profileDto = UserFeedProfileFactory::makeDto();
        $profileDto = $feedService->upsert($profileDto);

        $user = User::query()->find($profileDto->userId);
        Sanctum::actingAs($user);

        $response = $this->get('/api/user/likes?user_id=' . $user->id);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data',
            'next_cursor',
            'prev_cursor',
            'has_more',
            'total'
        ]);
    }
}
