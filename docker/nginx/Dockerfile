# Development stage
FROM nginx:alpine AS dev

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

WORKDIR /app
# Code is mounted as volume in dev - no COPY needed

# Production stage
FROM nginx:alpine AS prod

COPY docker/nginx/default.prod.conf /etc/nginx/conf.d/default.conf

WORKDIR /app

# Copy public directory (static assets + index.php entrypoint)
COPY public/ /app/public/
