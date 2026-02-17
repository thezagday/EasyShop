# EasyShop - Инструкция по развертыванию

В проекте два независимых пути развертывания: **Development** и **Production**.
Каждый использует свой compose-файл, свои Docker-образы и свою архитектуру.

---

## 1. Development (локальная разработка)

### Файлы

| Файл | Назначение |
|---|---|
| `docker-compose.yml` | Основной compose-файл для dev |
| `docker/php/Dockerfile` (target: `dev`) | PHP 8.2 + Xdebug |
| `docker/nginx/Dockerfile` | Nginx (в dev код монтируется через volume) |
| `docker/node/Dockerfile` (target: `dev`) | Node 20 для сборки фронта |
| `docker/php/entrypoint.sh` | Скрипт инициализации при старте контейнера |
| `.env` | Переменные окружения (создаётся из `.env.example`) |

### Контейнеры (4 штуки)

| Контейнер | Образ | Порты | Назначение |
|---|---|---|---|
| `easyshop-php` | `easyshop-php:dev` | 9000 (internal) | PHP-FPM + Xdebug |
| `easyshop-nginx` | `easyshop-nginx:latest` | 80, 443 | Веб-сервер |
| `easyshop-db` | `mysql:8.0` | 3306 (internal) | База данных |
| `easyshop-node` | `easyshop-node:dev` | — | Сборка фронта (yarn watch) |

### Как работает

1. **Код монтируется как volume** (`.:/app:cached`) — изменения в PHP/JS/CSS видны мгновенно без пересборки
2. **Vendor** хранится в отдельном Docker volume (`vendor:/app/vendor`) — не перезаписывается при монтировании
3. **Node-контейнер** запускает `yarn watch` — Webpack Encore следит за изменениями в `assets/` и пересобирает фронт автоматически
4. **При старте** PHP-контейнер (`entrypoint.sh`) автоматически:
   - Устанавливает composer-зависимости (если vendor пуст)
   - Создаёт базу данных (`doctrine:database:create --if-not-exists`)
   - Выполняет миграции (`doctrine:migrations:migrate`)
   - Очищает и прогревает кеш Symfony
   - Загружает фикстуры (только если `APP_ENV != prod` и таблица `user` пуста)
5. **Nginx** получает доступ к файлам через volume mount и проксирует PHP-запросы на `php:9000`
6. **Доступ**: http://localhost (сайт), http://admin.localhost (админка)

### Первый запуск

```bash
git clone <repo-url>
cd EasyShop
make install
```

`make install` выполняет:
1. `cp .env.example .env` (если `.env` не существует)
2. `docker compose build` (собирает образы dev, nginx, node)
3. `docker compose up -d` (запускает все 4 контейнера)

### Ежедневные команды

```bash
make up              # Запустить контейнеры
make down            # Остановить контейнеры
make restart-quick   # Перезапустить (сохранить БД)
make restart         # Перезапустить (удалить БД и пересоздать)
make logs-php        # Логи PHP-контейнера
make logs-node       # Логи Node-контейнера
make shell           # Войти в PHP-контейнер
make db-shell        # Войти в MySQL
make migrate         # Выполнить миграции
make cache           # Очистить кеш Symfony
make assets          # Собрать production-ассеты
make composer        # Установить composer-зависимости
make yarn            # Установить yarn-зависимости
make test            # Запустить тесты
make clean           # Удалить все контейнеры, volumes и образы
```

---

## 2. Production (боевой сервер)

### Файлы

| Файл | Назначение |
|---|---|
| `docker-compose.prod.yml` | Compose-файл для prod |
| `docker/php/Dockerfile` (target: `prod`) | PHP 8.2 + OPcache, без Xdebug |
| `docker/nginx/Dockerfile` | Nginx + `public/` запечатан внутри образа |
| `docker/node/Dockerfile` (target: `builder`) | Сборка ассетов (только при build) |
| `docker/php/entrypoint.sh` | Скрипт инициализации при старте |
| `Caddyfile` | Конфигурация Caddy (HTTPS, reverse proxy) |
| `.env` | Переменные окружения (на сервере) |

### Контейнеры (4 штуки)

| Контейнер | Образ | Порты | Назначение |
|---|---|---|---|
| `easyshop-php` | `easyshop-php:prod` | 9000 (internal) | PHP-FPM + OPcache |
| `easyshop-nginx` | `easyshop-nginx:prod` | — (internal) | Веб-сервер (только через Caddy) |
| `easyshop-db` | `mysql:8.0` | 3306 (internal) | База данных |
| `easyshop-caddy` | `caddy:2-alpine` | 80, 443 | HTTPS + reverse proxy |

### Как работает

#### Сборка образов (`make build-prod`)

Сборка происходит в 3 этапа:

**Этап 1: Сборка фронтенд-ассетов** (`make build-assets-prod`)
```
docker compose run --rm node yarn install
docker compose run --rm node yarn build
```
Node-контейнер из dev compose-файла устанавливает зависимости и собирает Webpack Encore.
Результат: скомпилированные JS/CSS файлы в `public/build/`.

**Этап 2: Сборка PHP-образа**
```
docker build --target prod -t easyshop-php:prod -f docker/php/Dockerfile .
```
Dockerfile (`prod` stage):
1. Берёт базовый образ `php:8.2-fpm-alpine`
2. Устанавливает PHP-расширения (intl, pdo_mysql, zip, opcache)
3. Копирует `composer.json` и `composer.lock`, устанавливает **только production** зависимости (`composer install --no-dev`)
4. Копирует весь код приложения внутрь образа
5. Копирует собранные ассеты (`public/build/`)
6. Устанавливает `APP_ENV=prod`
7. Генерирует оптимизированный autoloader (`composer dump-autoload --optimize`)
8. Создаёт директорию `var/` с правами `www-data`
9. **Не запускает `cache:clear`** при сборке (dev-bundles не установлены, это вызовет ошибку)

**Этап 3: Сборка Nginx-образа**
```
docker build -t easyshop-nginx:prod -f docker/nginx/Dockerfile .
```
Nginx Dockerfile:
1. Берёт базовый образ `nginx:alpine`
2. Копирует конфигурацию `docker/nginx/default.conf`
3. **Копирует `public/` внутрь образа** — nginx должен иметь доступ к `index.php` и статическим файлам

#### Запуск контейнеров

```
docker compose -f docker-compose.prod.yml up -d
```

**Ключевые отличия от dev:**
- `APP_ENV: prod` **жёстко задан** в `docker-compose.prod.yml` (не читается из `.env`)
- **Нет volume mounts** для кода — код запечатан внутри образов
- **Нет Node-контейнера** — ассеты уже собраны и запечатаны в образы
- **Caddy** стоит перед Nginx: автоматический HTTPS с Let's Encrypt для `easy-shop.by` и `admin.easy-shop.by`

#### При старте PHP-контейнера (`entrypoint.sh`)

1. Проверяет vendor (в prod он уже запечатан внутри образа — шаг пропускается)
2. Создаёт директорию `public/img` для загруженных файлов
3. Создаёт базу данных если не существует
4. Выполняет все миграции
5. Очищает Doctrine-кеш и Symfony-кеш
6. **Пропускает фикстуры** (потому что `APP_ENV=prod`)
7. Прогревает Symfony-кеш (`cache:warmup`)
8. Запускает `php-fpm`

#### Цепочка запросов

```
Клиент → Caddy (443/HTTPS) → Nginx (80) → PHP-FPM (9000)
                                 ↓
                          Статика (JS/CSS/IMG)
```

- **Caddy**: терминирует HTTPS, выдаёт сертификаты Let's Encrypt, проксирует на Nginx
- **Nginx**: отдаёт статические файлы напрямую, PHP-запросы проксирует на `php:9000`
- **PHP-FPM**: обрабатывает Symfony-запросы

### Первый деплой на сервер

```bash
# 1. Подготовка сервера
ssh root@server_ip
apt update && apt install -y docker.io docker-compose-plugin make git
systemctl enable docker

# 2. Клонирование
git clone <repo-url> ~/EasyShop
cd ~/EasyShop

# 3. Настройка .env
cp .env.example .env
nano .env
```

Обязательные изменения в `.env`:
```env
APP_ENV=prod
APP_SECRET=<случайная_строка_32_символа>

MYSQL_DATABASE=easyshop
MYSQL_USER=easyshop
MYSQL_PASSWORD='<надёжный_пароль>'
MYSQL_ROOT_PASSWORD='<надёжный_пароль_root>'
DATABASE_URL="mysql://easyshop:<пароль_mysql>@database:3306/easyshop?serverVersion=8.0&charset=utf8mb4"

ADMIN_HOST=admin.easy-shop.by
MAIN_HOST=easy-shop.by

MESSENGER_TRANSPORT_DSN=doctrine://default?auto_setup=0

AI_PROVIDER=openrouter
OPENROUTER_API_KEY=<ваш_ключ>
```

```bash
# 4. Сборка (ассеты + PHP + Nginx)
make build-prod

# 5. Запуск
docker compose -f docker-compose.prod.yml up -d

# 6. Проверка
docker ps
docker compose -f docker-compose.prod.yml logs -f php
# Ждём "Application is ready!"
```

### Обновление кода

```bash
cd ~/EasyShop
docker compose -f docker-compose.prod.yml down
git pull
make build-prod
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml logs -f php
```

### Полезные команды

```bash
# Логи
docker compose -f docker-compose.prod.yml logs -f php       # PHP
docker compose -f docker-compose.prod.yml logs -f nginx     # Nginx
docker compose -f docker-compose.prod.yml logs -f caddy     # Caddy
docker compose -f docker-compose.prod.yml logs -f database  # MySQL

# Доступ к контейнерам
docker compose -f docker-compose.prod.yml exec php sh
docker compose -f docker-compose.prod.yml exec database mysql -u easyshop -p easyshop

# Управление
docker compose -f docker-compose.prod.yml restart           # Перезапуск
docker compose -f docker-compose.prod.yml down              # Остановка
docker compose -f docker-compose.prod.yml down -v           # Остановка + удаление БД
```

---

## Сравнение Dev и Prod

| | Dev | Prod |
|---|---|---|
| **Compose-файл** | `docker-compose.yml` | `docker-compose.prod.yml` |
| **APP_ENV** | `dev` (из .env) | `prod` (жёстко в compose) |
| **Контейнеры** | php, nginx, db, node | php, nginx, db, caddy |
| **Код** | Volume mount (live reload) | Запечатан в образ |
| **Vendor** | Docker volume, `composer install` | `composer install --no-dev` внутри образа |
| **Фронт** | `yarn watch` в Node-контейнере | Pre-built, запечатан в оба образа |
| **Xdebug** | Включён | Нет |
| **OPcache** | Выключен | Агрессивный режим (без revalidate) |
| **Фикстуры** | Авто при пустой БД | Никогда |
| **HTTPS** | Нет | Caddy + Let's Encrypt |
| **Dev-bundles** | Установлены (debug, profiler, maker) | Не установлены |
| **Nginx доступ к файлам** | Volume mount | `public/` запечатан в образ |

---

## Безопасность

- Надёжные пароли для MySQL (не `easyshop` / `root`)
- Уникальный `APP_SECRET` (минимум 32 случайных символа)
- Порт MySQL **не открыт** наружу (только внутри Docker-сети)
- SSH-доступ **только по ключу** (отключить вход по паролю в `/etc/ssh/sshd_config`)
- Firewall: открыты **только** порты 22, 80, 443
- Файл `.env` в `.gitignore` — секреты не попадают в репозиторий

---

## Частые проблемы

### `ClassNotFoundError: DebugBundle`
**Причина:** `APP_ENV=dev` в контейнере, а dev-зависимости не установлены.
**Решение:** В `docker-compose.prod.yml` `APP_ENV: prod` задан жёстко. Убедитесь, что используете `docker-compose.prod.yml`, а не `docker-compose.yml`.

### `File not found` при обращении к сайту
**Причина:** Nginx-контейнер не имеет доступа к `public/`.
**Решение:** Пересоберите nginx-образ: `docker build -t easyshop-nginx:prod -f docker/nginx/Dockerfile .`

### Контейнер php перезапускается
**Причина:** Ошибка в `entrypoint.sh` (например, БД недоступна).
**Решение:** Проверьте логи: `docker compose -f docker-compose.prod.yml logs php`

### Ассеты не обновляются в prod
**Причина:** Ассеты запечатаны в образах.
**Решение:** Пересоберите оба образа: `make build-prod`
