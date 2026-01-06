<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\AdminSwipeConfigController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\TelegramController;
use App\Http\Controllers\Bot\TelegramBotController;
use App\Http\Controllers\Chat\ChatController;
use App\Http\Controllers\Dictionary\DictionaryController;
use App\Http\Controllers\Feed\FeedController;
use App\Http\Controllers\Moderation\ModerationController;
use App\Http\Controllers\Payment\PaymentController;
use App\Http\Controllers\Payment\StripeWebhookController;
use App\Http\Controllers\Payment\TributeWebhookController;
use App\Http\Controllers\Storage\FileController;
use App\Http\Controllers\User\ReportController;
use App\Http\Controllers\User\PresenceController;
use App\Http\Controllers\User\UserBlockController;
use App\Http\Controllers\User\UserProfileController;
use App\Http\Middleware\AdminServiceMiddleware;
use App\Http\Middleware\RecordActivityMiddleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [TelegramController::class, 'login']);
Route::post('/telegram/webhook', [TelegramBotController::class, 'webhook']);
Route::post('/telegram/moderation/webhook', [TelegramBotController::class, 'moderationWebhook']);
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handleWebhook']);
Route::post('/tribute/webhook', [TributeWebhookController::class, 'handleWebhook']);

Route::middleware(['auth:sanctum', RecordActivityMiddleware::class])->group(function () {
    Route::get('/me',[UserProfileController::class, 'me']);
    Route::get('/centrifugo/token', [AuthController::class, 'centrifugoToken']);

    /** MODERATION */
    Route::group(['prefix' => 'moderation'], function (){
       Route::get('/user-profile/photos',[ModerationController::class, 'validateUserProfilePhotos']);
    });

    /** DICTIONARY */
    Route::group(['prefix' => 'dictionary'], function () {
        Route::get('/cities', [DictionaryController::class, 'getCities']);
        Route::get('/countries', [DictionaryController::class, 'getCountries']);
        Route::get('/activities', [DictionaryController::class, 'getActivities']);
        Route::get('/hobbies', [DictionaryController::class, 'getHobbies']);
    });

    /** USERS */
    Route::get('/users/presence', [PresenceController::class, 'presence']);

    /** USER */
    Route::group(['prefix' => 'user'], function () {
        Route::get('/{id}',[UserProfileController::class,'getById'])->whereNumber('id');
        Route::get('/shared/{id}', [UserProfileController::class, 'getSharedProfile'])->whereNumber('id');
        Route::post('/profile', [UserProfileController::class, 'upsert']);
        Route::put('/search/preferences', [UserProfileController::class, 'updatePreferences']);
        Route::get('/likes', [UserProfileController::class, 'getLikes']);
        Route::post('/photos', [UserProfileController::class, 'updatePhotos']);
        Route::post('/photo/{photoId}/main',[UserProfileController::class, 'setMainPhoto'])->whereNumber('photoId');

        Route::get('/files', [UserProfileController::class, 'files']);
        Route::post('/files', [ModerationController::class, 'updateFilesWithModeration']);
        Route::post('/files/video', [UserProfileController::class, 'uploadVideo']);
        Route::delete('/files/video/{id}', [UserProfileController::class, 'deleteVideo'])->whereNumber('id');

        Route::get('/swipes', [UserProfileController::class, 'availableSwipes']);
        Route::get('/stats', [UserProfileController::class, 'getStats']);
        Route::get('/matches', [UserProfileController::class, 'getMatches']);

        Route::post('/onboard', [UserProfileController::class, 'onboard']);
        Route::post('/moderation', [UserProfileController::class, 'moderation']);

        Route::delete('/account', [UserProfileController::class, 'deleteAccount']);

        Route::post('/block', [UserBlockController::class, 'block']);
        Route::post('/unblock', [UserBlockController::class, 'unblock']);
    });

    /** REPORTS */
    Route::group(['prefix' => 'reports'], function () {
        Route::post('/', [ReportController::class, 'create']);
    });

    /** FEED */
    Route::group(['prefix' => 'feed'], function () {
        Route::post('/swipe', [FeedController::class, 'swipe']);
        Route::post('/swipe/revert', [FeedController::class, 'revertSwipe']);
        Route::get('/profiles', [FeedController::class, 'profiles']);
        Route::delete('/match', [FeedController::class, 'deleteMatch']);
        Route::put('/match/view', [FeedController::class, 'markMatchViewed']);
    });

    /** CHAT */
    Route::group(['prefix' => 'chat'], function () {
        Route::post('/', [ChatController::class, 'createChat']);
        Route::get('/', [ChatController::class, 'getUserChats']);
        Route::get('/{chat_id}/message', [ChatController::class, 'getChatMessages'])->whereNumber('id');
        Route::post('/message', [ChatController::class, 'sendMessage']);
        Route::put('/message', [ChatController::class, 'markMessageRead']);

        Route::get('/recent', [ChatController::class, 'getRecentChats']);
    });

    /** STORAGE */
    Route::group(['prefix' => 'storage'], function () {
       Route::post('/file/photo',[FileController::class, 'uploadPhoto']);
       Route::post('/file/video',[FileController::class, 'uploadVideo']);
       Route::delete('/file',[FileController::class, 'delete']);
       Route::patch('/files/order',[FileController::class, 'reorderFiles']);
    });

    /** PAYMENT */
    Route::group(['prefix' => 'payment'], function () {
        Route::get('/subscription', [PaymentController::class, 'currentSubscription']);
        Route::post('/subscription/cancel', [PaymentController::class, 'cancel']);
        Route::post('/subscribe', [PaymentController::class, 'subscribe']);
        Route::post('/telegram/invoice', [PaymentController::class, 'sendTelegramInvoice']);
        Route::post('/tribute', [PaymentController::class, 'tribute']);
    });

    /** PLUSDATE ADMIN */
    Route::group(['prefix' => 'admin'], function () {
        Route::post('/create-bot', [AdminController::class, 'createProfile']);

        // Swipe limits configuration
        Route::get('/swipe-config', [AdminSwipeConfigController::class, 'getAll']);
        Route::put('/swipe-config', [AdminSwipeConfigController::class, 'update']);
        Route::post('/swipe-config/reset', [AdminSwipeConfigController::class, 'resetToDefaults']);
    });

    Route::group(['prefix' => 'likes'], function () {
       Route::post('/respond', [FeedController::class, 'respond']);
    });
});

//Route::post('/user/account/restore', [UserProfileController::class, 'restoreAccount']);

Route::get('/healthcheck', function (Request $request) {
    return response()->json(['status' => 'ok']);
});

Route::middleware([AdminServiceMiddleware::class])->group(function () {
    Route::delete('/admin/user/{user_id}', [AdminController::class, 'deleteAccount'])->whereNumber('user_id');
    Route::post('/admin/premium/grant', [AdminController::class, 'handleGrantPremium']);
    Route::post('/admin/premium/revoke', [AdminController::class, 'handleRevokePremium']);


    Route::get('/admin/profiles', [ModerationController::class, 'getProfiles']);

    Route::put('/admin/users/{id}/status', [AdminController::class, 'updateUserStatus'])->whereNumber('id');
    Route::get('/moderation/user', [ModerationController::class, 'getUser']);
    Route::put('/moderation/status',[ModerationController::class, 'updateStatus']);
    Route::put('/admin/user', [AdminController::class, 'updateUser']);
});
