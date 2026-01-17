<?php

namespace App\Console\Commands;

use App\Enums\Core\FileTypeEnum;
use App\Jobs\File\GeneratePhotoVersionsJob;
use App\Models\User\UserFile;
use Illuminate\Console\Command;

class GenerateMissingPhotoVersionsCommand extends Command
{
    protected $signature = 'photos:generate-versions {--chunk=100 : Number of records to process at once} {--queue=default : Queue name for jobs}';

    protected $description = 'Generate missing photo versions (mini, medium, blurred) for existing user files via async jobs';

    public function handle(): int
    {
        $chunkSize = (int) $this->option('chunk');
        $queue = $this->option('queue');

        $total = UserFile::query()
            ->whereNull('deleted_at')
            ->where('type', FileTypeEnum::IMAGE->value)
            ->count();

        $this->info("Dispatching {$total} jobs to queue '{$queue}'...");

        $dispatched = 0;

        UserFile::query()
            ->whereNull('deleted_at')
            ->where('type', FileTypeEnum::IMAGE->value)
            ->chunkById($chunkSize, function ($files) use ($queue, &$dispatched) {
                foreach ($files as $file) {
                    GeneratePhotoVersionsJob::dispatch($file->filepath, $file->id)
                        ->onQueue($queue);
                    $dispatched++;
                    $this->info("Dispatching $file->id to queue");
                }
            });

        $this->info("Dispatched {$dispatched} jobs. Run workers to process:");
        $this->info("  php artisan queue:work --queue={$queue}");

        return Command::SUCCESS;
    }
}
