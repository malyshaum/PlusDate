<?php

namespace App\Events;

use App\Clients\CentrifugoClient;

trait BroadcastsViaCentrifugoTrait
{
    public static function broadcast(mixed ...$args): static
    {
        $instance = new static(...$args);
        $instance->broadcastNow();

        return $instance;
    }

    public function broadcastNow(): void
    {
        $client = app(CentrifugoClient::class);
        $channels = $this->broadcastOn();
        $event = $this->broadcastAs();
        $data = $this->broadcastWith();

        $channelNames = array_map(
            fn($channel) => is_string($channel) ? $channel : $channel->name,
            $channels
        );

        $client->publish($channelNames, $event, $data);
    }

    abstract public function broadcastOn(): array;

    abstract public function broadcastAs(): string;

    abstract public function broadcastWith(): array;
}
