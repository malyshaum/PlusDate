<?php

namespace App\Mapping\User;

use App\Dto\User\CreateReportDto;
use App\Enums\User\ReportReasonEnum;
use App\Enums\User\ReportSourceEnum;
use AutoMapperPlus\CustomMapper\CustomMapper;

class ArrayToCreateReportDtoMapper extends CustomMapper
{
    /**
     * @param array $source
     * @param CreateReportDto $destination
     */
    public function mapToObject($source, $destination): CreateReportDto
    {
        $destination->reporterUserId = $source['user_id'];
        $destination->reportedUserId = $source['reported_user_id'];
        $destination->reasonCode = ReportReasonEnum::from($source['reason_code']);
        $destination->customText = $source['custom_text'] ?? null;
        $destination->source = ReportSourceEnum::from($source['source']);

        return $destination;
    }
}
