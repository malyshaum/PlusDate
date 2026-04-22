<?php

namespace App\Clients;

use Exception;
use Illuminate\Support\Facades\Log;
use PhpAmqpLib\Channel\AMQPChannel;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;
use Throwable;

final class RabbitMQClient
{
    private ?AMQPStreamConnection $connection = null;
    private ?AMQPChannel $channel = null;

    /**
     * @throws Exception
     */
    public function publishToExchange(string $exchange, string $routingKey, array $data): void
    {
        try {
            $channel = $this->getChannel();
            $channel->exchange_declare($exchange, 'topic', false, true, false);

            $message = new AMQPMessage(json_encode($data), [
                'delivery_mode' => AMQPMessage::DELIVERY_MODE_PERSISTENT
            ]);

            $channel->basic_publish($message, $exchange, $routingKey);
        } catch (Throwable $exception) {
            Log::error($exception->getMessage());
            $this->close();
        }
    }

    /**
     * @throws Exception
     */
    private function getChannel(): AMQPChannel
    {
        if ($this->channel !== null && $this->channel->is_open() && $this->connection?->isConnected()) {
            return $this->channel;
        }

        $this->reconnect();

        return $this->channel;
    }

    /**
     * @throws Exception
     */
    private function reconnect(): void
    {
        $this->close();

        $this->connection = new AMQPStreamConnection(
            config('queue.connections.rabbitmq.host'),
            config('queue.connections.rabbitmq.port'),
            config('queue.connections.rabbitmq.user'),
            config('queue.connections.rabbitmq.password'),
            config('queue.connections.rabbitmq.vhost')
        );

        $this->channel = $this->connection->channel();
    }

    private function close(): void
    {
        try {
            $this->channel?->close();
        } catch (Throwable) {}

        try {
            $this->connection?->close();
        } catch (Throwable) {}

        $this->channel = null;
        $this->connection = null;
    }

    public function __destruct()
    {
        $this->close();
    }
}
