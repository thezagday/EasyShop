# Symfony Messenger Setup

## Overview

The application uses Symfony Messenger for asynchronous processing of heavy tasks like PDF-to-PNG conversion for shop maps.

## Configuration

### Transport

The messenger transport is configured in `config/packages/messenger.yaml` and uses Redis as the default transport (defined in `.env`):

```bash
MESSENGER_TRANSPORT_DSN=redis://redis:6379/messages
```

Redis service is available via `docker-compose.yml` as the `redis` container.

### Routes

Messages are routed to the `async` transport:

- `ProcessShopPdfToMapImageMessage` - Converts uploaded PDF shop maps to PNG format

## Running the Worker

To process messages in the queue, you need to run the messenger worker:

### Development

```bash
php bin/console messenger:consume async -vv
```

Options:
- `-vv` - Verbose output to see what's being processed
- `--limit=10` - Stop after processing 10 messages
- `--time-limit=3600` - Stop after 1 hour
- `--memory-limit=128M` - Stop if memory exceeds limit

### Production

For production, you should run the worker as a supervised process (e.g., with systemd, supervisor, or Docker):

#### Using Supervisor

Create `/etc/supervisor/conf.d/messenger-worker.conf`:

```ini
[program:messenger-worker]
command=php /path/to/project/bin/console messenger:consume async --time-limit=3600
user=www-data
numprocs=2
startsecs=0
autostart=true
autorestart=true
process_name=%(program_name)s_%(process_num)02d
```

Then:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start messenger-worker:*
```

#### Using systemd

Create `/etc/systemd/system/messenger-worker@.service`:

```ini
[Unit]
Description=Symfony Messenger Worker %i
After=mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/project
ExecStart=/usr/bin/php bin/console messenger:consume async --time-limit=3600
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable messenger-worker@{1..2}.service
sudo systemctl start messenger-worker@{1..2}.service
```

## How It Works

### PDF to Map Image Processing

1. Admin uploads a PDF file in the Shop CRUD form
2. `ShopCrudController` saves the PDF and dispatches `ProcessShopPdfToMapImageMessage`
3. The message is stored in the `messenger_messages` database table
4. The worker picks up the message and executes `ProcessShopPdfToMapImageHandler`
5. The handler:
   - Converts PDF to high-res PNG using `pdftocairo`
   - Resizes and pads the image to 1653x993 using ImageMagick `convert`
   - Saves the final PNG in `public/img/`
   - Updates the Shop entity with the map image filename
6. Admin receives a flash message: "PDF файл загружен. Карта будет сгенерирована в фоновом режиме."

## Monitoring

### View pending messages

```bash
php bin/console messenger:stats
```

### View failed messages

```bash
php bin/console messenger:failed:show
```

### Retry failed messages

```bash
php bin/console messenger:failed:retry
```

## Troubleshooting

### Messages not being processed

1. Check if the worker is running:
   ```bash
   ps aux | grep messenger:consume
   ```

2. Check database for pending messages:
   ```sql
   SELECT * FROM messenger_messages WHERE queue_name = 'default';
   ```

3. Check logs:
   ```bash
   tail -f var/log/dev.log
   ```

### PDF conversion failures

Requirements:
- `pdftocairo` (from poppler-utils package)
- `convert` (from ImageMagick package)

Install on Ubuntu/Debian:
```bash
sudo apt-get install poppler-utils imagemagick
```

## Docker Setup

The project includes Redis service in `docker-compose.yml`:

```yaml
redis:
  image: redis:7-alpine
  container_name: easyshop-redis
  command: redis-server --appendonly yes
  volumes:
    - redis_data:/data
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 5s
    timeout: 3s
    retries: 5
  networks:
    - easyshop
```

### Running Worker in Docker

To run the messenger worker, execute inside the `php` container:

```bash
docker exec -it easyshop-php php bin/console messenger:consume async -vv
```

Or add a dedicated worker service to `docker-compose.yml`:

```yaml
messenger-worker:
  build:
    context: .
    dockerfile: docker/php/Dockerfile
    target: dev
  image: easyshop-php:dev
  container_name: easyshop-messenger-worker
  volumes:
    - .:/app:cached
    - vendor:/app/vendor
  environment:
    APP_ENV: ${APP_ENV:-dev}
    DATABASE_URL: ${DATABASE_URL}
    MESSENGER_TRANSPORT_DSN: ${MESSENGER_TRANSPORT_DSN}
  command: php bin/console messenger:consume async --time-limit=3600 --memory-limit=128M
  depends_on:
    database:
      condition: service_healthy
    redis:
      condition: service_healthy
  networks:
    - easyshop
  restart: unless-stopped
```
