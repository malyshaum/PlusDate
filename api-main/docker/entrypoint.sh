#!/bin/bash
set -e

echo "Running migrations"
php artisan migrate --force

echo "php artisan package:discover --ansi"
php artisan package:discover --ansi

echo "Starting supervisor"
exec /usr/bin/supervisord -c /etc/supervisor/supervisord.conf
