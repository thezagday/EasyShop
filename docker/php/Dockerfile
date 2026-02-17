# syntax=docker/dockerfile:1

FROM php:8.2-fpm-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    bash \
    git \
    icu-dev \
    imagemagick \
    libpq-dev \
    libzip-dev \
    poppler-utils \
    zip \
    unzip

# Install PHP extensions
RUN docker-php-ext-install \
    intl \
    pdo_mysql \
    zip \
    opcache

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Development stage
FROM base AS dev

# Install Xdebug for development
RUN apk add --no-cache linux-headers $PHPIZE_DEPS bash \
    && pecl install xdebug \
    && docker-php-ext-enable xdebug

# PHP development configuration
RUN echo "memory_limit=512M" > /usr/local/etc/php/conf.d/memory-limit.ini

# Copy entrypoint script
COPY docker/php/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 9000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php-fpm"]

# Production stage
FROM base AS prod

# PHP production configuration
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
RUN echo "opcache.enable=1" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.memory_consumption=256" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.max_accelerated_files=20000" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.validate_timestamps=0" >> /usr/local/etc/php/conf.d/opcache.ini

# Copy application files
COPY composer.json composer.lock symfony.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

COPY . .

# In production, we assume assets are already built in public/build
# This preserves the separation of concerns for the application
COPY public/build ./public/build

# Set production environment for build
ENV APP_ENV=prod
ENV APP_SECRET=build-time-secret-will-be-overridden-at-runtime

RUN composer dump-autoload --optimize \
    && composer run-script post-install-cmd

# Set permissions
RUN chown -R www-data:www-data var/

# Copy entrypoint script
COPY docker/php/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 9000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php-fpm"]
