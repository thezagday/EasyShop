.PHONY: help build up down restart logs shell db-shell migrate fixtures assets install clean

# Default target
help:
	@echo "EasyShop Docker Commands"
	@echo "========================"
	@echo ""
	@echo "  make install    - First time setup (build, start, install deps, migrate)"
	@echo "  make up         - Start all containers"
	@echo "  make down       - Stop all containers"
	@echo "  make restart    - Restart all containers"
	@echo "  make build      - Build Docker images"
	@echo "  make logs       - View logs (all containers)"
	@echo "  make logs-php   - View PHP logs"
	@echo "  make logs-node  - View Node logs"
	@echo "  make shell      - Open shell in PHP container"
	@echo "  make db-shell   - Open PostgreSQL shell"
	@echo "  make migrate    - Run database migrations"
	@echo "  make fixtures   - Load fixtures"
	@echo "  make assets     - Build production assets"
	@echo "  make composer   - Run composer install"
	@echo "  make yarn       - Run yarn install"
	@echo "  make cache      - Clear Symfony cache"
	@echo "  make test       - Run PHPUnit tests"
	@echo "  make clean      - Remove all containers, volumes, and images"
	@echo ""

# Build Docker images
build:
	docker compose build

# Build production assets (on host via container)
build-assets-prod:
	docker compose run --rm node yarn install
	docker compose run --rm node yarn build

# Build production PHP image
# Requires assets to be built first
build-prod: build-assets-prod
	docker build --target prod -t easyshop-php:prod -f docker/php/Dockerfile .

# Start containers
up:
	docker compose up -d

# Stop containers
down:
	docker compose down

# Restart containers
restart: down up

# View all logs
logs:
	docker compose logs -f

# View PHP container logs
logs-php:
	docker compose logs -f php

# View Node container logs
logs-node:
	docker compose logs -f node

# Open shell in PHP container
shell:
	docker compose exec php sh

# Open MySQL shell
db-shell:
	docker compose exec database mysql -u easyshop -peasyshop easyshop

# Run database migrations
migrate:
	docker compose exec php bin/console doctrine:migrations:migrate --no-interaction

# Load fixtures
fixtures:
	docker compose exec php bin/console doctrine:database:drop --force --if-exists
	docker compose exec php bin/console doctrine:database:create
	docker compose exec php bin/console doctrine:migrations:migrate --no-interaction
	docker compose exec php bin/console doctrine:fixtures:load --no-interaction

# Build production assets
assets:
	docker compose exec node yarn build

# Run composer install
composer:
	docker compose exec php composer install

# Run yarn install
yarn:
	docker compose exec node yarn install

# Clear Symfony cache
cache:
	docker compose exec php bin/console cache:clear

# Run tests
test:
	docker compose exec php bin/phpunit

# First time installation
install: build env
	docker compose up -d
	@echo ""
	@echo "============================================"
	@echo "EasyShop is starting..."
	@echo "Migrations and fixtures run automatically."
	@echo "Check logs: make logs-php"
	@echo "Open http://localhost in your browser"
	@echo "============================================"

# Create .env file from example if it doesn't exist
env:
	@test -f .env || cp .env.example .env

# Clean up everything
clean:
	docker compose down -v --rmi all
	@echo "Cleaned up all containers, volumes, and images"
