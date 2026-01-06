<?php

use App\Console\Commands\Payment\CheckSubscriptionCommand;
use App\Console\Commands\UpdateSwipePhases;
use App\Console\Commands\User\CleanupDeletedAccountsCommand;
use Illuminate\Support\Facades\Schedule;

Schedule::command(CleanupDeletedAccountsCommand::class)->daily()->runInBackground();
Schedule::command(CheckSubscriptionCommand::class)->daily()->runInBackground();
Schedule::command(UpdateSwipePhases::class)->hourly()->runInBackground();
