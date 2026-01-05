<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'telegram' => [
        'bot'           => env('TELEGRAM_BOT_NAME'),
        'client_id'     => null,
        'client_secret' => env('TELEGRAM_TOKEN'),
        'redirect'      => env('TELEGRAM_REDIRECT_URI'),
        'mini_app_url'  => env('TELEGRAM_MINI_APP_URL'),
        'bot_tokens' => explode(',', env('BOT_TOKENS', "")),
    ],

    'immaga' => [
        'public' => env('IMMAGA_PUBLIC_KEY'),
        'private' => env('IMMAGA_PRIVATE_KEY'),
    ],

    'admin' => [
        'jwt' => env('ADMIN_JWT_SECRET'),
    ],

    'tribute' => [
        'api_key' => env('TRIBUTE_API_KEY'),
    ],

    'centrifugo' => [
        'url' => env('CENTRIFUGO_URL'),
        'secret' => env('CENTRIFUGO_SECRET'),
        'api_key' => env('CENTRIFUGO_API_KEY'),
    ]
];
