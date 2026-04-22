<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_healthcheck_returns_successful_response(): void
    {
        $response = $this->getJson('/api/healthcheck');

        $response->assertOk()->assertJson([
            'status' => 'ok',
        ]);
    }
}
