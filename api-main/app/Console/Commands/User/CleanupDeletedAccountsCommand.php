<?php

namespace App\Console\Commands\User;

use App\Models\User\UserDeletionSnapshot;
use App\Services\User\AccountDeletionService;
use Exception;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CleanupDeletedAccountsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:cleanup-deleted-accounts';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Permanently delete user accounts that have been soft-deleted for over 30 days';

    /**
     * Execute the console command.
     */
    public function handle(AccountDeletionService $deletionService): void
    {
        $this->info('Starting cleanup of deleted accounts...');

        $snapshots = UserDeletionSnapshot::query()
            ->whereNull('hard_deleted_at')
            ->whereNotNull('can_restore_until')
            ->where('can_restore_until', '<', now())
            ->get();

        $count = 0;

        foreach ($snapshots as $snapshot) {
            try {
                $this->info("Processing user_id: {$snapshot->user_id}");

                $deletionService->hardDeleteAccount($snapshot->user_id);

                $count++;
                $this->info("User {$snapshot->user_id} permanently deleted");

            } catch (Exception $e) {
                $this->error("Failed to delete user {$snapshot->user_id}: {$e->getMessage()}");
                Log::error('Cleanup failed for user', [
                    'user_id' => $snapshot->user_id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        $this->info("Cleanup complete. Processed {$count} accounts.");
    }
}
