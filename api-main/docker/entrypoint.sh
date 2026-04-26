#!/bin/bash
set -euo pipefail

echo "Ensuring database extensions"
php -r '
require "vendor/autoload.php";
$app = require "bootstrap/app.php";
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

if (config("database.default") !== "pgsql") {
    exit(0);
}

$extensions = ["vector"];

if (config("database.use_postgis")) {
    $extensions = ["postgis", "postgis_topology", "vector"];
}

foreach ($extensions as $extension) {
    try {
        Illuminate\Support\Facades\DB::statement("CREATE EXTENSION IF NOT EXISTS {$extension}");
        fwrite(STDOUT, "Extension ensured: {$extension}\n");
    } catch (Throwable $e) {
        fwrite(STDERR, "Extension {$extension} was not enabled: {$e->getMessage()}\n");
    }
}
'

echo "Running migrations"
php artisan migrate --force

echo "php artisan package:discover --ansi"
php artisan package:discover --ansi

echo "Starting supervisor"
exec /usr/bin/supervisord -c /etc/supervisor/supervisord.conf
