#!/bin/bash
set -e

# Install dependencies first if vendor is empty
if [ ! -d "vendor" ] || [ -z "$(ls -A vendor 2>/dev/null)" ]; then
    echo "Installing Composer dependencies..."
    composer install --no-interaction --optimize-autoloader
fi

echo "Database is ready (guaranteed by Docker healthcheck)"

mkdir -p public/img
chown -R www-data:www-data public/img 2>/dev/null || true
chmod -R ug+rwX,o+rX public/img 2>/dev/null || true

# Create database and run migrations
echo "Setting up database..."
php bin/console doctrine:database:create --if-not-exists
php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration

# Load fixtures if DB is fresh (no users table or empty)
if ! php bin/console doctrine:query:sql "SELECT COUNT(*) FROM user" 2>/dev/null | grep -q "1"; then
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
