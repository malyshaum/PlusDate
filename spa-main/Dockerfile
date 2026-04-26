# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Declare build arguments
ARG VITE_MODE=prod
ARG VITE_API_URL
ARG VITE_SOCKET_AUTH_URL
ARG VITE_SOCKET_HOST
ARG VITE_SOCKET_PORT
ARG VITE_GTM_TOKEN
ARG VITE_CENTRIFUGO_WS_URL
ARG VITE_MAINTENANCE_MODE

# Make them available as ENV for the build
ENV VITE_MODE=$VITE_MODE
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_AUTH_URL=$VITE_SOCKET_AUTH_URL
ENV VITE_SOCKET_HOST=$VITE_SOCKET_HOST
ENV VITE_SOCKET_PORT=$VITE_SOCKET_PORT
ENV VITE_GTM_TOKEN=$VITE_GTM_TOKEN
ENV VITE_CENTRIFUGO_WS_URL=$VITE_CENTRIFUGO_WS_URL
ENV VITE_MAINTENANCE_MODE=$VITE_MAINTENANCE_MODE

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build && npm cache clean --force

# Production stage
FROM nginx:1.27-alpine

# Copy built files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

RUN touch /tmp/nginx.pid \
    && chown -R nginx:nginx /tmp /var/cache/nginx /usr/share/nginx/html

USER nginx

# Expose port 8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
