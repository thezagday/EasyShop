# EasyShop - Optimal routes for shopping

EasyShop is a young startup that helps people to spend their time efficiently inside a big store.

## Quick Start (Docker)

The project is fully containerized. To get started, you only need **Docker** and **Make**.

### 1. Initial Installation
This command will build images, start containers, install dependencies, and run database migrations with fixtures:
```bash
make install
```

### 2. Standard Launch
If the project is already installed, just run:
```bash
make up
```
The application will be available at: **http://localhost**

### 3. Credentials
Two users are created by default via fixtures:
*   **Admin**: `admin@example.com` / `password`
*   **User**: `user@example.com` / `password`

Login page: **http://localhost/login**

---

## Frontend Development & Build

We use **Symfony Webpack Encore** (React, Leaflet).

### Development Mode
By default, `make up` starts a Node container in **watch** mode. Any changes in `assets/` will automatically trigger a rebuild.

To see Node logs:
```bash
make logs-node
```

### Manual Commands
*   **Install JS dependencies**: `make yarn`
*   **Production Build (into public/build)**: `make build-assets-prod`

---

## Production Build (Extreme Separation)

Our PHP image is completely agnostic of Node.js. To build a production-ready PHP image:

1.  **Build assets in a temporary container**:
    ```bash
    make build-assets-prod
    ```
    This will place the compiled assets into the `public/build` folder on your host.

2.  **Build the PHP production image**:
    ```bash
    make build-prod
    ```
    The PHP Dockerfile will copy the pre-built assets from `public/build` into the image.

---

## Useful Makefile Commands

| Command | Description |
| :--- | :--- |
| `make up` | Start all containers |
| `make down` | Stop all containers |
| `make shell` | Open shell inside PHP container |
| `make db-shell` | Open MySQL shell |
| `make migrate` | Run database migrations |
| `make fixtures` | Load data fixtures |
| `make logs-php` | View PHP-FPM logs |
| `make clean` | Remove all containers, volumes, and images |

---

## Technical Stack
*   **Backend**: PHP 8.2 (Symfony 7.3)
*   **Database**: MySQL 8.0
*   **Frontend**: React, Leaflet
*   **Infrastructure**: Docker, Nginx, Makefile
