<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Core\ErrorMessageEnum;
use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Services\User\SwipeLimitConfigService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class AdminSwipeConfigController extends Controller
{
    private const array VALID_CONFIG_KEYS = [
        'free_male_initial_swipes',
        'free_male_phase2_swipes',
        'free_male_phase3_swipes',
        'free_male_cooldown_swipes',
        'cooldown_hours',
        'premium_superlike_limit',
        'free_superlike_limit',
    ];

    public function __construct(
        private readonly SwipeLimitConfigService $configService,
    ) {
    }

    public function getAll(): Response|JsonResponse
    {
        $configs = $this->configService->getAllConfigs();

        return $this->response($configs);
    }

    /**
     * @throws ApiException
     */
    public function update(Request $request): Response|JsonResponse
    {
        $request->validate([
            'config_key' => [
                'required',
                'string',
                Rule::in(self::VALID_CONFIG_KEYS),
            ],
            'config_value' => [
                'required',
                'integer',
                'min:0',
            ],
        ]);

        $key = $request->input('config_key');
        $value = $request->input('config_value');

        $updated = $this->configService->updateConfig($key, $value);

        if (!$updated) {
            throw new ApiException(ErrorMessageEnum::ADMIN_INVALID_CONFIG_KEY, 400);
        }

        return $this->response(['message' => 'Configuration updated successfully']);
    }

    public function resetToDefaults(): Response|JsonResponse
    {
        $defaults = [
            'free_male_initial_swipes' => 100,
            'free_male_phase2_swipes' => 50,
            'free_male_phase3_swipes' => 25,
            'free_male_cooldown_swipes' => 25,
            'cooldown_hours' => 6,
            'premium_superlike_limit' => 5,
            'free_superlike_limit' => 0,
        ];

        foreach ($defaults as $key => $value) {
            $this->configService->updateConfig($key, $value);
        }

        return $this->response(['message' => 'Configurations reset to defaults']);
    }
}
