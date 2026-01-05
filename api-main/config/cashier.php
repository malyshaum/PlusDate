<?php

use Laravel\Cashier\Console\WebhookCommand;
use Laravel\Cashier\Invoices\DompdfInvoiceRenderer;

return [

    /*
    |--------------------------------------------------------------------------
    | Stripe Keys
    |--------------------------------------------------------------------------
    |
    | The Stripe publishable key and secret key give you access to Stripe's
    | API. The "publishable" key is typically used when interacting with
    | Stripe.js while the "secret" key accesses private API endpoints.
    |
    */

    'key' => env('STRIPE_KEY'),

    'secret' => env('STRIPE_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | Cashier Path
    |--------------------------------------------------------------------------
    |
    | This is the base URI path where Cashier's views, such as the payment
    | verification screen, will be available from. You're free to tweak
    | this path according to your preferences and application design.
    |
    */

    'path' => env('CASHIER_PATH', 'stripe'),

    /*
    |--------------------------------------------------------------------------
    | Stripe Webhooks
    |--------------------------------------------------------------------------
    |
    | Your Stripe webhook secret is used to prevent unauthorized requests to
    | your Stripe webhook handling controllers. The tolerance setting will
    | check the drift between the current time and the signed request's.
    |
    */

    'webhook' => [
        'secret' => env('STRIPE_WEBHOOK_SECRET'),
        'tolerance' => env('STRIPE_WEBHOOK_TOLERANCE', 300),
        'events' => array_merge(WebhookCommand::DEFAULT_EVENTS, ['payment_intent.succeeded']),
    ],

    /*
    |--------------------------------------------------------------------------
    | Currency
    |--------------------------------------------------------------------------
    |
    | This is the default currency that will be used when generating charges
    | from your application. Of course, you are welcome to use any of the
    | various world currencies that are currently supported via Stripe.
    |
    */

    'currency' => env('CASHIER_CURRENCY', 'usd'),

    /*
    |--------------------------------------------------------------------------
    | Currency Locale
    |--------------------------------------------------------------------------
    |
    | This is the default locale in which your money values are formatted in
    | for display. To utilize other locales besides the default en locale
    | verify you have the "intl" PHP extension installed on the system.
    |
    */

    'currency_locale' => env('CASHIER_CURRENCY_LOCALE', 'en'),

    /*
    |--------------------------------------------------------------------------
    | Payment Confirmation Notification
    |--------------------------------------------------------------------------
    |
    | If this setting is enabled, Cashier will automatically notify customers
    | whose payments require additional verification. You should listen to
    | Stripe's webhooks in order for this feature to function correctly.
    |
    */

    'payment_notification' => env('CASHIER_PAYMENT_NOTIFICATION'),

    /*
    |--------------------------------------------------------------------------
    | Invoice Settings
    |--------------------------------------------------------------------------
    |
    | The following options determine how Cashier invoices are converted from
    | HTML into PDFs. You're free to change the options based on the needs
    | of your application or your preferences regarding invoice styling.
    |
    */

    'invoices' => [
        'renderer' => env('CASHIER_INVOICE_RENDERER', DompdfInvoiceRenderer::class),

        'options' => [
            // Supported: 'letter', 'legal', 'A4'
            'paper' => env('CASHIER_PAPER', 'letter'),

            'remote_enabled' => env('CASHIER_REMOTE_ENABLED', false),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Stripe Logger
    |--------------------------------------------------------------------------
    |
    | This setting defines which logging channel will be used by the Stripe
    | library to write log messages. You are free to specify any of your
    | logging channels listed inside the "logging" configuration file.
    |
    */

    'logger' => env('CASHIER_LOGGER'),

    'price_ids' => [
        'three_days' => env('STRIPE_THREE_DAYS_PRICE_ID'),
        'week' => env('STRIPE_WEEK_PRICE_ID'),
        'month' => env('STRIPE_MONTH_PRICE_ID'),
        'three_month' => env('STRIPE_THREE_MONTH_PRICE_ID'),
    ],

    'prices_usd' => [
        'week' => env('WEEK_PRICE_USD'),
        'month' => env('MONTH_PRICE_USD'),
        'three_month' => env('THREE_MONTH_PRICE_USD'),
    ],
    'prices_stars' => [
        'week' => env('WEEK_PRICE_STARS'),
        'month' => env('MONTH_PRICE_STARS'),
        'three_month' => env('THREE_MONTH_PRICE_STARS'),
        'three_days' => env('THREE_DAYS_PRICE_STARS'),
    ],

    'redirect_url' => env('PAYMENT_REDIRECT_URL'),

    'tribute' => [
        'links' => [
            'week' => env('TRIBUTE_WEEK_PRICE_LINK'),
            'month' => env('TRIBUTE_MONTH_PRICE_LINK'),
            'three_month' => env('TRIBUTE_THREE_MONTH_PRICE_LINK'),
            'three_days' => env('TRIBUTE_THREE_DAYS_PRICE_LINK'),
        ],
        'products' => [
            'week' => env('TRIBUTE_WEEK_ID'),
            'month' => env('TRIBUTE_MONTH_ID'),
            'three_month' => env('TRIBUTE_THREE_MONTH_ID'),
            'three_days' => env('TRIBUTE_THREE_DAYS_ID'),
        ]
    ],
];
