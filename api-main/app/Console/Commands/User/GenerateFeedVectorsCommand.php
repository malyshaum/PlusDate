<?php

namespace App\Console\Commands\User;

use App\Dto\User\UserFeedProfileDto;
use App\Mapping\User\UserMapping;
use App\Models\User\UserFeedProfile;
use App\Services\User\UserFeedProfileService;
use App\Services\User\VectorService;
use AutoMapperPlus\AutoMapper;
use Illuminate\Console\Command;

class GenerateFeedVectorsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:generate-feed-vectors-command';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Rebuild vectors for feed profiles';

    /**
     * Execute the console command.
     */
    public function handle(VectorService $vectorService, AutoMapper $autoMapper, UserFeedProfileService $userFeedProfileService): int
    {
        UserFeedProfile::query()->chunk(1000, function ($userFeedProfiles) use ($vectorService,$autoMapper, $userFeedProfileService) {
            $userFeedProfiles->each(function (UserFeedProfile $userFeedProfile) use ($vectorService, $autoMapper, $userFeedProfileService) {
                /** @see UserMapping */
                /** @var $feedProfileDto UserFeedProfileDto  */
                $feedProfileDto = $autoMapper->map($userFeedProfile->toArray(), UserFeedProfileDto::class);

                $vector = $vectorService->createFromDto($feedProfileDto);

                $userFeedProfile->vector = $vector;
                $userFeedProfile->save();

                $this->info('feed profile: '.$userFeedProfile->id.' vector: '.print_r($vector, true));
            });
        });

        return 0;
    }
}
