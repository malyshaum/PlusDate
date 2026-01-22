<?php

namespace App\Exceptions;

use App\Enums\Core\ErrorMessageEnum;
use Exception;
use Illuminate\Http\JsonResponse;

class ApiException extends Exception
{
    protected int $statusCode;

    public function __construct(ErrorMessageEnum $message, int $statusCode = 500, Exception $previous = null)
    {
        parent::__construct($message->value, 0, $previous);
        $this->statusCode = $statusCode;
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
        ], $this->statusCode);
    }
}
