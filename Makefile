.PHONY: help build up up-prod down restart logs shell db-shell migrate fixtures assets install clean

COMPOSE_DEV = docker compose -f docker-compose.yml -f docker-compose.dev.yml
COMPOSE_PROD = docker compose -f docker-compose.yml -f docker-compose.prod.yml
NODE_BUILD_IMAGE ?= node:20-alpine

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
	@echo "  make up-prod       - Start prod stack (docker-compose.prod.yml only)"
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
	$(COMPOSE_DEV) build

# Build production assets (on host via container)
build-assets-prod:
	docker run --rm \
		-v $(CURDIR):/app \
		-w /app \
		-u $$(id -u):$$(id -g) \
		$(NODE_BUILD_IMAGE) \
		sh -lc "corepack enable && yarn install --frozen-lockfile && yarn build"

# Build production PHP image
# Requires assets to be built first
build-prod: build-assets-prod
	docker build --target prod -t easyshop-php:prod -f docker/php/Dockerfile .
	docker build --target prod -t easyshop-nginx:prod -f docker/nginx/Dockerfile .

# Deploy to production (using docker-compose.prod.yml)
deploy-prod: build-prod
	$(COMPOSE_PROD) up -d

# Stop production containers
stop-prod:
	$(COMPOSE_PROD) down

# Start containers (development — always docker-compose.yml, not prod file)
up:
	$(COMPOSE_DEV) up -d

# Start production stack (requires easyshop-php:prod / easyshop-nginx:prod images — run build-prod first)
up-prod:
	$(COMPOSE_PROD) up -d

# Stop containers
down:
	$(COMPOSE_DEV) down

# Stop containers and remove volumes (database)
down-clean:
	$(COMPOSE_DEV) down -v

# Restart containers (with fresh database)
restart: down-clean up

# Quick restart without removing database
restart-quick: down up

# View all logs
logs:
	$(COMPOSE_DEV) logs -f

# View PHP container logs
logs-php:
	$(COMPOSE_DEV) logs -f php

# View Node container logs
logs-node:
	$(COMPOSE_DEV) logs -f node

# Open shell in PHP container
shell:
	$(COMPOSE_DEV) exec php sh

# Open MySQL shell
db-shell:
	$(COMPOSE_DEV) exec database mysql -u easyshop -peasyshop easyshop

# Run database migrations
migrate:
	$(COMPOSE_DEV) exec php bin/console doctrine:migrations:migrate --no-interaction

# Load fixtures (DEV/TEST ONLY - use at your own risk in production!)
fixtures:
	@echo "⚠️  WARNING: This will DROP and recreate the database!"
	@echo "⚠️  Only use in dev/test environments."
	@read -p "Continue? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		$(COMPOSE_DEV) exec php bin/console doctrine:database:drop --force --if-exists && \
		$(COMPOSE_DEV) exec php bin/console doctrine:database:create && \
		$(COMPOSE_DEV) exec php bin/console doctrine:migrations:migrate --no-interaction && \
		$(COMPOSE_DEV) exec php bin/console doctrine:fixtures:load --no-interaction; \
	fi

# Build production assets
assets:
	$(COMPOSE_DEV) exec node yarn build

# Run composer install
composer:
	$(COMPOSE_DEV) exec php composer install

# Run yarn install
yarn:
	$(COMPOSE_DEV) exec node yarn install

# Clear Symfony cache
cache:
	$(COMPOSE_DEV) exec php bin/console cache:clear

# Run tests
test:
	$(COMPOSE_DEV) exec php bin/phpunit

# First time installation
install: env build
	$(COMPOSE_DEV) up -d
	@echo ""
	@echo "============================================"
	@echo "EasyShop is starting..."
	@echo "Migrations run automatically in the PHP entrypoint; fixtures: make fixtures (dev only)."
	@echo "Check logs: make logs-php"
	@echo "Open http://localhost in your browser"
	@echo "============================================"

# Create .env file from example if it doesn't exist
env:
	@test -f .env || cp .env.example .env

# Clean up everything
clean:
	$(COMPOSE_DEV) down -v --rmi all
	@echo "Cleaned up all containers, volumes, and images"
