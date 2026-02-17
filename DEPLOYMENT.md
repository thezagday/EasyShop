# EasyShop - Инструкция по развертыванию

## 1. Development (локальная разработка)

### Требования
- Docker и Docker Compose
- Git

### Первый запуск
```bash
# Клонировать репозиторий
git clone <repo-url>
cd EasyShop

# Создать .env из примера (НЕ менять APP_ENV=dev)
cp .env.example .env

# Собрать образы и запустить
make install
```

Эта команда:
1. Создаст `.env` из `.env.example`
2. Соберёт Docker-образы (`php:dev`, `nginx`, `node`, `mysql`)
3. Запустит все контейнеры
4. PHP-контейнер автоматически: установит composer-зависимости, создаст БД, выполнит миграции, загрузит фикстуры

### Ежедневная работа
```bash
make up              # Запустить контейнеры
make down            # Остановить контейнеры
make logs-php        # Логи PHP-контейнера
make shell           # Войти в PHP-контейнер
make migrate         # Выполнить миграции
make cache           # Очистить кеш Symfony
```

### Особенности dev-режима
- Код монтируется как volume — изменения видны сразу
- Node-контейнер запускает `yarn watch` — фронт пересобирается автоматически
- Xdebug включён
- Фикстуры загружаются автоматически при пустой БД
- Доступ: http://localhost (сайт), http://admin.localhost (админка)

---

## 2. Production (сервер)

### Требования
- Сервер с Docker и Docker Compose
- Git
- Домены настроены на IP сервера (easy-shop.by, admin.easy-shop.by)

### Первый деплой

#### Шаг 1: Подготовка сервера
```bash
ssh root@server_ip

# Установить Docker (если не установлен)
curl -fsSL https://get.docker.com | sh

# Установить Docker Compose plugin (если не установлен)
apt install docker-compose-plugin

# Установить make
apt install make
```

#### Шаг 2: Клонирование и настройка
```bash
git clone <repo-url>
cd EasyShop

# Создать .env
cp .env.example .env
nano .env
```

Обязательно изменить в `.env`:
```
APP_ENV=prod
APP_SECRET=<случайная_строка_32_символа>
MYSQL_DATABASE=easyshop
MYSQL_USER=easyshop
MYSQL_PASSWORD='<надёжный_пароль>'
MYSQL_ROOT_PASSWORD='<надёжный_пароль_root>'
DATABASE_URL="mysql://easyshop:<пароль_mysql>@database:3306/easyshop?serverVersion=8.0&charset=utf8mb4"
ADMIN_HOST=admin.easy-shop.by
MAIN_HOST=easy-shop.by
OPENROUTER_API_KEY=<ваш_ключ>
AI_PROVIDER=openrouter
```

#### Шаг 3: Сборка и запуск
```bash
# Собрать prod-образы (включает сборку фронта)
make build-prod

# Запустить
docker compose -f docker-compose.prod.yml up -d

# Проверить логи
docker compose -f docker-compose.prod.yml logs -f php
```

При первом запуске PHP-контейнер автоматически:
1. Создаст базу данных
2. Выполнит все миграции
3. Прогреет кеш Symfony

#### Шаг 4: Проверка
```bash
# Проверить что все контейнеры работают
docker ps

# Должны быть: easyshop-php, easyshop-nginx, easyshop-caddy, easyshop-db
```

### Обновление кода на сервере
```bash
cd ~/EasyShop

# Остановить контейнеры
docker compose -f docker-compose.prod.yml down

# Получить новый код
git pull

# Пересобрать образы
make build-prod

# Запустить (миграции выполнятся автоматически)
docker compose -f docker-compose.prod.yml up -d

# Проверить логи
docker compose -f docker-compose.prod.yml logs -f php
```

### Полезные команды на сервере
```bash
# Логи PHP
docker compose -f docker-compose.prod.yml logs -f php

# Логи всех контейнеров
docker compose -f docker-compose.prod.yml logs -f

# Войти в PHP-контейнер
docker compose -f docker-compose.prod.yml exec php sh

# Войти в MySQL
docker compose -f docker-compose.prod.yml exec database mysql -u easyshop -p easyshop

# Перезапустить без пересборки
docker compose -f docker-compose.prod.yml restart

# Полная остановка
docker compose -f docker-compose.prod.yml down
```

### Особенности prod-режима
- Код запечатан внутри Docker-образа (не монтируется как volume)
- OPcache включён в агрессивном режиме
- Xdebug отключён
- Dev-зависимости (debug-bundle, profiler и т.д.) не устанавливаются
- Фикстуры НЕ загружаются
- HTTPS через Caddy с автоматическими сертификатами Let's Encrypt
- `APP_ENV=prod` жёстко задан в `docker-compose.prod.yml`

---

## Разница между dev и prod

| | Dev | Prod |
|---|---|---|
| Compose-файл | `docker-compose.yml` | `docker-compose.prod.yml` |
| Код | Volume mount (live) | Запечатан в образ |
| Зависимости | Все (включая dev) | Только production |
| Xdebug | Да | Нет |
| OPcache | Нет | Да (агрессивный) |
| Фикстуры | Авто при пустой БД | Нет |
| HTTPS | Нет | Caddy + Let's Encrypt |
| Фронт | Node watch (авто) | Pre-built в образе |

---

## Безопасность

- Надёжные пароли для MySQL (не `easyshop` / `root`)
- Уникальный `APP_SECRET` (минимум 32 символа)
- Порт MySQL НЕ открыт наружу (только внутри Docker-сети)
- Firewall: открыты только порты 80, 443, 22
- SSH-доступ только по ключу (отключить вход по паролю)
