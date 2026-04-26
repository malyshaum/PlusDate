FROM openswoole/swoole:25.2-php8.4
WORKDIR /var/www

RUN apt-get update && apt-get install -y \
    curl libxml2-dev imagemagick libmagickwand-dev \
    zip unzip libzip-dev libpq-dev \
    ffmpeg supervisor \
    && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install \
    pdo pdo_pgsql bcmath xml zip opcache pcntl sockets \
    && pecl install imagick redis \
    && docker-php-ext-enable imagick redis

# ImageMagick policy
RUN for policy in /etc/ImageMagick*/policy.xml; do \
        if [ -f "$policy" ]; then \
            sed -i 's/<policy domain="resource" name="memory" value=".*"\/>/<policy domain="resource" name="memory" value="2GiB"\/>/' "$policy" && \
            sed -i 's/<policy domain="resource" name="map" value=".*"\/>/<policy domain="resource" name="map" value="2GiB"\/>/' "$policy" && \
            sed -i 's/<policy domain="resource" name="disk" value=".*"\/>/<policy domain="resource" name="disk" value="4GiB"\/>/' "$policy"; \
        fi \
    done

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# ── Конфиги (меняются редко — кешируются) ──
COPY docker/php.ini /usr/local/etc/php/php.ini
COPY docker/supervisord.conf /etc/supervisor/supervisord.conf
COPY docker/octane.conf /etc/supervisor/conf.d/octane.conf
COPY docker/generate-certs.sh /generate-certs.sh
COPY docker/entrypoint.sh /entrypoint.sh
COPY docker/cron-config /etc/cron.d/cron-config

RUN echo "upload_max_filesize = 500M" > /usr/local/etc/php/conf.d/uploads.ini && \
    echo "post_max_size = 500M" >> /usr/local/etc/php/conf.d/uploads.ini && \
    echo "memory_limit = 512M" >> /usr/local/etc/php/conf.d/uploads.ini && \
    echo "max_execution_time = 60" >> /usr/local/etc/php/conf.d/uploads.ini && \
    echo "max_input_time = 300" >> /usr/local/etc/php/conf.d/uploads.ini

RUN chmod +x /generate-certs.sh /entrypoint.sh \
    && chmod 0644 /etc/cron.d/cron-config \
    && mkdir -p /tmp/supervisor \
    && chown -R www-data:www-data /tmp/supervisor

# ── Зависимости (пересобираются ТОЛЬКО при изменении composer.json/lock) ──
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

# ── Код приложения (меняется часто, но ниже composer install) ──
COPY . /var/www

RUN composer dump-autoload --optimize --no-scripts \
    && chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage \
    && chmod -R 755 /var/www/bootstrap/cache

USER www-data

EXPOSE 8000 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl --fail http://127.0.0.1:8000/api/healthcheck || exit 1

ENTRYPOINT ["/entrypoint.sh"]
