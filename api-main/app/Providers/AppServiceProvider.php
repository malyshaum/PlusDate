<?php

namespace App\Providers;

use App\Clients\CentrifugoClient;
use App\Clients\ImmagaClient;
use App\Clients\RabbitMQClient;
use App\Repositories\ChatRepository;
use App\Repositories\ChatRepositoryInterface;
use App\Repositories\User\UserBlockRepository;
use App\Repositories\User\UserBlockRepositoryInterface;
use App\Repositories\User\UserSwipeRepository;
use App\Repositories\User\UserSwipeRepositoryInterface;
use App\Services\Admin\PremiumManagementService;
use App\Services\Admin\PremiumManagementServiceInterface;
use App\Services\User\UserBlockingService as UserUserBlockingService;
use App\Services\User\UserBlockingServiceInterface as UserUserBlockingServiceInterface;
use App\Services\Payment\PremiumNotificationService;
use App\Services\Payment\PremiumNotificationServiceInterface;
use App\Services\User\NameNormalizationService;
use App\Services\User\NameNormalizationServiceInterface;
use Illuminate\Support\ServiceProvider;
use Intervention\Image\ImageManager;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(ImageManager::class, function () {
            return ImageManager::imagick();
        });

        $this->app->singleton(ImmagaClient::class, function () {
            $immagaConfig = config('services.immaga');
            return new ImmagaClient(
                $immagaConfig['public'],
                $immagaConfig['private'],
                ImageManager::imagick()
            );
        });

        $this->app->singleton(RabbitMQClient::class, function () {
            return new RabbitMQClient();
        });

        $this->app->singleton(CentrifugoClient::class, function () {
            return new CentrifugoClient();
        });

        $this->app->bind(
            PremiumManagementServiceInterface::class,
            PremiumManagementService::class
        );

        $this->app->bind(
            PremiumNotificationServiceInterface::class,
            PremiumNotificationService::class
        );

        $this->app->bind(
            UserSwipeRepositoryInterface::class,
            UserSwipeRepository::class
        );

        $this->app->bind(
            ChatRepositoryInterface::class,
            ChatRepository::class
        );

        $this->app->bind(
            UserBlockRepositoryInterface::class,
            UserBlockRepository::class
        );

        $this->app->bind(
            UserUserBlockingServiceInterface::class,
            UserUserBlockingService::class
        );

        $this->app->bind(
            NameNormalizationServiceInterface::class,
            NameNormalizationService::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {

    }
}
