<?php

namespace App\Services\User;

use App\Clients\RabbitMQClient;
use App\Dto\User\CreateReportDto;
use App\Enums\User\ReportReasonEnum;
use Exception;
use Illuminate\Support\Facades\Log;

readonly class ReportService
{
    public function __construct(
        private RabbitMQClient $rabbitMQClient,
    ) {
    }

    /**
     * @throws Exception
     */
    public function createReport(CreateReportDto $dto): void
    {
        try {
            $this->rabbitMQClient->publishToExchange('plusdate', 'user.report', [
                'reporter_user_id' => $dto->reporterUserId,
                'reported_user_id' => $dto->reportedUserId,
                'reason_code' => $dto->reasonCode->value,
                'custom_text' => $dto->customText,
                'source' => $dto->source->value,
            ]);

            Log::info('[ReportService] User report event published to RabbitMQ', [
                'reporter_user_id' => $dto->reporterUserId,
                'reported_user_id' => $dto->reportedUserId,
                'reason_code' => $dto->reasonCode->value,
                'source' => $dto->source->value,
            ]);
        } catch (Exception $exception) {
            Log::error('Failed to publish user report event to RabbitMQ', [
                'error' => $exception->getMessage(),
                'reporter_user_id' => $dto->reporterUserId,
                'reported_user_id' => $dto->reportedUserId,
            ]);
            throw $exception;
        }
    }
}

