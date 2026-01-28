#!/bin/bash
set -e

# Install dependencies first if vendor is empty
if [ ! -d "vendor" ] || [ -z "$(ls -A vendor 2>/dev/null)" ]; then
    echo "Installing Composer dependencies..."
    composer install --no-interaction --optimize-autoloader
fi

# Database is guaranteed to be ready by Docker's depends_on + healthcheck
echo "Database is ready (guaranteed by Docker healthcheck)"

# Run migrations
echo "Running database migrations..."
php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration

# Load fixtures only if database is empty (check for users)
USER_COUNT=$(php bin/console doctrine:query:sql "SELECT COUNT(*) FROM user" 2>/dev/null | grep -oE '[0-9]+' | tail -1 || echo "0")
if [ "$USER_COUNT" = "0" ] || [ -z "$USER_COUNT" ]; then
    echo "Loading fixtures..."
    php bin/console doctrine:fixtures:load --no-interaction --append
fi

# Clear and warm up cache
echo "Warming up cache..."
php bin/console cache:clear --no-warmup
php bin/console cache:warmup

echo "============================================"
echo "Application is ready!"
echo "============================================"

# Execute the main command (php-fpm)
exec "$@"
