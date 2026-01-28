# syntax=docker/dockerfile:1

FROM php:8.2-fpm-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    bash \
    git \
    icu-dev \
    libpq-dev \
    libzip-dev \
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

# Node stage for building assets
FROM node:20-alpine AS node-builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY webpack.config.js ./
COPY assets ./assets

RUN yarn build

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

# Copy built assets from node stage
COPY --from=node-builder /app/public/build ./public/build

RUN composer dump-autoload --optimize \
    && composer run-script post-install-cmd

# Set permissions
RUN chown -R www-data:www-data var/

EXPOSE 9000

CMD ["php-fpm"]
