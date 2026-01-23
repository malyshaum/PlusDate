<?php

namespace App\Http\Controllers;

use App\Dto\CursorCollectionDto;
use BackedEnum;
use Carbon\Carbon;
use Clickbar\Magellan\Data\Geometries\Point;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;
use stdClass;

abstract class Controller
{
    public function response($data = null, $status = 200, $headers = []): Response|JsonResponse
    {
        if ($data === null) {
            return response()->json($data, Response::HTTP_OK);
        }

        if (
            $data instanceof LengthAwarePaginator
            || $data instanceof Collection
            || $data instanceof Model
        ) {
            $data = $data->toArray();
        }

        if (is_string($data) || is_array($data) || is_object($data)) {
            $transformedData = $this->transformKeysToSnakeCase($data);
            return response()->json($transformedData, $status, $headers);
        }

        return response($data, $status, $headers);
    }

    private function transformKeysToSnakeCase($data)
    {
        if (is_array($data)) {
            $result = [];
            foreach ($data as $key => $value) {
                $snakeKey = Str::snake($key);
                $result[$snakeKey] = $this->transformKeysToSnakeCase($value);
            }
            return $result;
        }

        if (is_object($data)) {
            if ($data instanceof CursorCollectionDto) {
                return $data->toArray();
            }

            if ($data instanceof BackedEnum) {
                return $data->value;
            }

            if ($data instanceof Carbon) {
                return $data->toISOString();
            }

            if ($data instanceof Point) {
                return [
                    'latitude' => $data->getY(),
                    'longitude' => $data->getX(),
                ];
            }

            if ($data instanceof \Illuminate\Support\Collection) {
                return $data->toArray();
            }

            $result = new stdClass();
            foreach (get_object_vars($data) as $key => $value) {
                $snakeKey = Str::snake($key);
                $result->$snakeKey = $this->transformKeysToSnakeCase($value);
            }
            return $result;
        }

        return $data;
    }
}
