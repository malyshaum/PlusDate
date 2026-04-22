<?php

namespace Tests\Feature\Http\Controllers\User;

use App\Enums\Core\EyeColorEnum;
use App\Enums\Core\GenderEnum;
use App\Enums\Core\SearchForEnum;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserProfileControllerTest extends TestCase
{
    public function test_update_preferences_creates_new_search_preference(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $requestData = [
            'include_nearby' => true,
            'from_age' => 18,
            'to_age' => 30,
            'expand_age_range' => false,
            'gender' => GenderEnum::FEMALE->value,
            'search_for' => SearchForEnum::RELATIONS->value,
            'eye_color' => [EyeColorEnum::GREEN->value],
            'hobbies' => [1, 2, 3],
            'with_video' => true,
            'with_premium' => false,
        ];

        $response = $this->putJson('/api/user/search/preferences', $requestData);

        $response->assertOk()->assertJson([
            'user_id' => $user->id,
            'include_nearby' => true,
            'from_age' => 18,
            'to_age' => 30,
            'gender' => GenderEnum::FEMALE->value,
            'search_for' => SearchForEnum::RELATIONS->value,
            'eye_color' => [EyeColorEnum::GREEN->value],
            'hobbies' => [1, 2, 3],
            'with_video' => true,
            'with_premium' => false,
        ]);
    }

    public function test_update_preferences_updates_existing_preference_via_api(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->putJson('/api/user/search/preferences', [
            'from_age' => 20,
            'to_age' => 25,
            'gender' => GenderEnum::MALE->value,
        ])->assertOk();

        $response = $this->putJson('/api/user/search/preferences', [
            'from_age' => 22,
            'gender' => GenderEnum::FEMALE->value,
            'with_video' => true,
        ]);

        $response->assertOk()->assertJson([
            'user_id' => $user->id,
            'from_age' => 22,
            'to_age' => 25,
            'gender' => GenderEnum::FEMALE->value,
            'with_video' => true,
        ]);
    }

    public function test_update_preferences_validation_errors(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->putJson('/api/user/search/preferences', [
            'from_age' => 15,
            'to_age' => 101,
            'gender' => 'invalid_gender',
            'search_for' => 999,
            'eye_color' => 'invalid_color',
            'city_id' => 99999,
            'activity_id' => 99999,
            'include_nearby' => 'not_boolean',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors([
            'from_age',
            'to_age',
            'gender',
            'search_for',
            'eye_color',
            'city_id',
            'activity_id',
            'include_nearby',
        ]);
    }

    public function test_update_preferences_requires_authentication(): void
    {
        $response = $this->putJson('/api/user/search/preferences', [
            'from_age' => 18,
            'to_age' => 30,
        ]);

        $response->assertStatus(401);
    }

    public function test_me_returns_current_user(): void
    {
        $user = User::factory()->create([
            'name' => 'Test User',
        ]);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/me');

        $response->assertOk()->assertJsonStructure([
            'id',
            'name',
            'username',
            'photo_url',
            'language_code',
            'is_onboarded',
            'is_under_moderation',
            'files',
            'blocked',
            'blocked_at',
        ])->assertJson([
            'id' => $user->id,
            'name' => 'Test User',
        ]);
    }

    public function test_upsert_profile_updates_basic_user_fields(): void
    {
        $user = User::factory()->create([
            'name' => 'Before Update',
        ]);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/user/profile', [
            'name' => 'Updated Name',
            'profile_description' => 'Updated bio text',
        ]);

        $response->assertOk()->assertJson([
            'id' => $user->id,
            'name' => 'Updated Name',
            'profile_description' => 'Updated bio text',
        ]);
    }
}
