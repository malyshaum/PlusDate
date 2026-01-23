<?php

namespace App\Http\Controllers\Dictionary;

use App\Http\Controllers\Controller;
use App\Services\Dictionary\DictionaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DictionaryController extends Controller
{
    public function __construct(
        private readonly DictionaryService $dictionaryService
    )
    {

    }

    public function getCities(Request $request): JsonResponse
    {
        $request->validate([
            'text' => 'sometimes|string|max:255',
            'latitude' => 'sometimes|numeric|between:-90,90',
            'longitude' => 'sometimes|numeric|between:-180,180',
        ]);

        return $this->response(
            $this->dictionaryService->cities(
                $request->input('text'),
                $request->input('latitude'),
                $request->input('longitude')
            )
        );
    }

    public function getCountries(Request $request): JsonResponse
    {
        $request->validate([
            'text' => 'required|string|max:255',
        ]);

        return $this->response(
            $this->dictionaryService->countries($request->input('text'))
        );
    }

    public function getActivities(Request $request): JsonResponse
    {
        $request->validate([
            'text' => 'sometimes|string|max:255',
        ]);

        return $this->response(
            $this->dictionaryService->activities($request->input('text'))
        );
    }

    public function getHobbies(Request $request): JsonResponse
    {
        $request->validate([
            'text' => 'sometimes|string|max:255',
        ]);

        return $this->response(
            $this->dictionaryService->hobbies($request->input('text'))
        );
    }
}
