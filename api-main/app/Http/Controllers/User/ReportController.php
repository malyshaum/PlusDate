<?php

namespace App\Http\Controllers\User;

use App\Dto\User\CreateReportDto;
use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\CreateReportRequest;
use App\Services\User\ReportService;
use AutoMapperPlus\AutoMapper;
use AutoMapperPlus\Exception\UnregisteredMappingException;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class ReportController extends Controller
{
    public function __construct(
        private readonly ReportService $reportService,
        private readonly AutoMapper $mapper,
    ) {
    }

    /**
     * @throws UnregisteredMappingException
     * @throws ApiException
     */
    public function create(CreateReportRequest $request): JsonResponse
    {
        /** @var CreateReportDto $dto */
        /** @see UserMapping::arrayToCreateReportDto */
        $dto = $this->mapper->map($request->validated(), CreateReportDto::class);

        $this->reportService->createReport($dto);

        return $this->response([], Response::HTTP_CREATED);
    }
}

