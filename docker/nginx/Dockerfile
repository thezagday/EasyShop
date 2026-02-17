FROM nginx:alpine

# Copy custom configuration
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

WORKDIR /app

# Copy public directory (static assets + index.php entrypoint)
COPY public/ /app/public/
