.PHONY: help build up down restart logs shell db-shell migrate fixtures assets install clean

# Default target
help:
	@echo "EasyShop Docker Commands"
	@echo "========================"
	@echo ""
	@echo "Development:"
	@echo "  make install       - First time setup (build, start, install deps, migrate)"
	@echo "  make up            - Start all containers"
	@echo "  make down          - Stop all containers"
	@echo "  make down-clean    - Stop containers and remove database"
	@echo "  make restart       - Restart with fresh database"
	@echo "  make restart-quick - Restart without removing database"
	@echo "  make build         - Build Docker images"
	@echo ""
	@echo "Production:"
	@echo "  make build-prod    - Build production image with assets"
	@echo "  make deploy-prod   - Deploy to production (build + up)"
	@echo "  make stop-prod     - Stop production containers"
	@echo ""
	@echo "Utilities:"
	@echo "  make logs       - View logs (all containers)"
	@echo "  make logs-php   - View PHP logs"
	@echo "  make logs-node  - View Node logs"
	@echo "  make shell      - Open shell in PHP container"
	@echo "  make db-shell   - Open MySQL shell"
	@echo "  make migrate    - Run database migrations"
	@echo "  make fixtures   - Load fixtures (DEV ONLY)"
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
	docker build --target prod -t easyshop-nginx:prod -f docker/nginx/Dockerfile .

# Deploy to production (using docker-compose.prod.yml)
deploy-prod: build-prod
	docker compose -f docker-compose.prod.yml up -d

# Stop production containers
stop-prod:
	docker compose -f docker-compose.prod.yml down

# Start containers (development)
up:
	docker compose up -d

# Stop containers
down:
	docker compose down

# Stop containers and remove volumes (database)
down-clean:
	docker compose down -v

# Restart containers (with fresh database)
restart: down-clean up

# Quick restart without removing database
restart-quick: down up

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

# Load fixtures (DEV/TEST ONLY - use at your own risk in production!)
fixtures:
	@echo "⚠️  WARNING: This will DROP and recreate the database!"
	@echo "⚠️  Only use in dev/test environments."
	@read -p "Continue? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose exec php bin/console doctrine:database:drop --force --if-exists && \
		docker compose exec php bin/console doctrine:database:create && \
		docker compose exec php bin/console doctrine:migrations:migrate --no-interaction && \
		docker compose exec php bin/console doctrine:fixtures:load --no-interaction; \
	fi

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
install: env build
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
