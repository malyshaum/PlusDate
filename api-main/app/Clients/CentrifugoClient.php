<?php

namespace App\Clients;

use Firebase\JWT\JWT;
use GuzzleHttp\Client;
use GuzzleHttp\Promise\PromiseInterface;
use GuzzleHttp\Promise\Utils;
use Illuminate\Support\Facades\Log;
use OpenSwoole\Coroutine;

class CentrifugoClient
{
    private string $apiUrl;
    private string $apiKey;
    private string $secret;
    private Client $client;

    public function __construct()
    {
        $this->apiUrl = config('services.centrifugo.url');
        $this->apiKey = config('services.centrifugo.api_key');
        $this->secret = config('services.centrifugo.secret');
        $this->client = new Client([
            'base_uri' => $this->apiUrl,
            'timeout' => 5.0,
            'headers' => [
                'Content-Type' => 'application/json',
                'X-API-Key' => $this->apiKey,
            ],
        ]);
    }

    public function generateToken(int $userId): string
    {
        $payload = [
            'sub' => (string)$userId,
            'exp' => time() + 3600,
            'iat' => time(),
        ];

        return JWT::encode($payload, $this->secret, 'HS256');
    }

    /**
     * @param array<string> $channels
     * @param string $event
     * @param array $data
     */
    public function publish(array $channels, string $event, array $data): void
    {
        $payload = [
            'event' => $event,
            'data' => $data,
        ];

        Coroutine::create(function () use ($channels, $payload) {
            $this->sendRequests($channels, $payload);
        });
    }

    private function sendRequests(array $channels, array $payload): void
    {
        $promises = [];
        foreach ($channels as $channel) {
            $promises[] = $this->sendRequestAsync($channel, $payload);
        }
        Utils::settle($promises)->wait();
    }

    public function publishToUser(int $userId, string $event, array $data): void
    {
        $this->publish(['#' . $userId], $event, $data);
    }

    private function sendRequestAsync(string $channel, array $payload): PromiseInterface
    {
        $body = json_encode([
            'method' => 'publish',
            'params' => [
                'channel' => $channel,
                'data' => $payload,
            ],
        ]);

        return $this->client->postAsync('/api', ['body' => $body])
            ->then(
                function ($response) use ($channel) {
                    if ($response->getStatusCode() !== 200) {
                        Log::error('Centrifugo publish failed', [
                            'channel' => $channel,
                            'status' => $response->getStatusCode(),
                            'body' => $response->getBody()->getContents(),
                        ]);
                    }
                },
                function ($exception) use ($channel) {
                    Log::error('Centrifugo publish error', [
                        'channel' => $channel,
                        'error' => $exception->getMessage(),
                    ]);
                }
            );
    }

    public function isUserInChannel(int $userId, string $channel): bool
    {
        $presence = $this->getChannelPresence($channel);

        return isset($presence[(string)$userId]);
    }

    public function getChannelPresence(string $channel): array
    {
        try {
            $response = $this->client->post('/api', [
                'json' => [
                    'method' => 'presence',
                    'params' => [
                        'channel' => $channel,
                    ],
                ],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            if (isset($data['result']['presence'])) {
                return $data['result']['presence'];
            }

            return [];

        } catch (\Exception $e) {
            Log::warning('Failed to get Centrifugo presence', [
                'channel' => $channel,
                'error' => $e->getMessage(),
            ]);

            return [];
        }
    }

    public function getChannelPresenceCount(string $channel): int
    {
        return count($this->getChannelPresence($channel));
    }
}
