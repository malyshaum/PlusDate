<?php

namespace App\Dto\User;

use App\Dto\BaseDto;
use App\Enums\User\ReportReasonEnum;
use App\Enums\User\ReportSourceEnum;

class CreateReportDto extends BaseDto
{
    public int $reporterUserId;
    public int $reportedUserId;
    public ReportReasonEnum $reasonCode;
    public string|null $customText = null;
    public ReportSourceEnum $source;
}
