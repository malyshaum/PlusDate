<?php

namespace Tests\Feature\Http\Controllers\Feed;

use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FeedControllerTest extends TestCase
{
    private const SWIPE_URI = '/api/feed/swipe';

    public function test_swipe_requires_authentication(): void
    {
        $response = $this->postJson(self::SWIPE_URI, []);

        $response->assertStatus(401);
    }

    public function test_swipe_validates_required_fields(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson(self::SWIPE_URI, [
            'profile_id' => 0,
            'action' => 'invalid-action',
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors([
                'profile_id',
                'action',
            ]);
    }
}
