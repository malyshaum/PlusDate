<?php

namespace App\Console\Commands;

use App\Models\User\UserSwipeState;
use App\Services\User\SwipeLimitConfigService;
use App\Services\User\SwipeLimitService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class UpdateSwipePhases extends Command
{
    protected $signature = 'swipe:update-phases';
    protected $description = 'Update swipe phases for users whose cooldown has expired';

    public function __construct(
        private readonly SwipeLimitService       $swipeLimitService,
        private readonly SwipeLimitConfigService $configService,
    ) {
        parent::__construct();
    }

    public function handle(): void
    {
        $this->info('Checking for users with expired cooldowns...');

        $cooldownHours = $this->configService->getConfig('cooldown_hours', 6);
        $cutoffTime = Carbon::now()->subHours($cooldownHours);

        $expiredStates = UserSwipeState::query()
            ->where('phase_started_at', '<=', $cutoffTime)
            ->get();

        $count = 0;

        foreach ($expiredStates as $state) {
            try {
                $phaseLimit = $this->getPhaseLimit($state->current_phase);

                if ($state->swipes_used_in_phase >= $phaseLimit) {
                    $this->swipeLimitService->transitionPhase($state->user_id);
                    $count++;

                    $this->info("Transitioned user {$state->user_id} from {$state->current_phase} to next phase");
                }
            } catch (\Exception $e) {
                Log::error("Failed to transition phase for user {$state->user_id}: {$e->getMessage()}");
                $this->error("Failed to transition user {$state->user_id}");
            }
        }

        $this->info("Successfully transitioned {$count} users to next phase");
    }

    private function getPhaseLimit(string $phase): int
    {
        return match ($phase) {
            'initial' => $this->configService->getConfig('free_male_initial_swipes', 100),
            'phase2' => $this->configService->getConfig('free_male_phase2_swipes', 50),
            'phase3' => $this->configService->getConfig('free_male_phase3_swipes', 25),
            'cooldown' => $this->configService->getConfig('free_male_cooldown_swipes', 25),
            default => 0,
        };
    }
}
