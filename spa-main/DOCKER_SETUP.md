# Docker Production Deployment (Hetzner)

## Prerequisites

- Hetzner server with SSH access
- Domain name pointed to your server IP

## Server Setup

SSH into your Hetzner server and install Docker:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group (optional, to run without sudo)
sudo usermod -aG docker $USER

# Log out and back in for group changes to take effect
```

## Deploy the Application

### 1. Create app directory

```bash
mkdir -p /opt/plusdate-spa
cd /opt/plusdate-spa
```

### 2. Upload files to server

**Option A: Using git (recommended)**
```bash
cd /opt/plusdate-spa
git clone your-repo-url .
```

**Option B: Using scp from local machine**
```bash
scp docker-compose.yml Dockerfile nginx.conf .dockerignore user@your-server:/opt/plusdate-spa/
```

### 3. Create .env file on server

```bash
cd /opt/plusdate-spa
nano .env
```

Add your production environment variables:
```
VITE_API_URL=https://api.plus.date
VITE_SOCKET_AUTH_URL=https://plusdate-stage.up.railway.app/auth
VITE_SOCKET_HOST=ws.plus.date
VITE_SOCKET_PORT=443
VITE_GTM_TOKEN=GTM-XXXXXXX
```

Save and exit (Ctrl+O, Enter, Ctrl+X)

### 4. Build and run

```bash
cd /opt/plusdate-spa
docker compose up -d --build
```

### 5. Verify it's running

```bash
# Check container status
docker compose ps

# View logs
docker compose logs -f app

# Test locally on server
curl http://localhost
```

## SSL/HTTPS Setup with Caddy

Install Caddy for automatic SSL certificates:

```bash
# Install Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# Configure Caddyfile
sudo nano /etc/caddy/Caddyfile
```

Replace contents with:
```
your-domain.com {
    reverse_proxy localhost:80
}
```

```bash
# Reload Caddy (it will automatically get SSL certificate)
sudo systemctl reload caddy
```

## Update Deployment

```bash
cd /opt/plusdate-spa

# Pull latest changes (if using git)
git pull

# Update .env if needed
nano .env

# Rebuild and restart
docker compose up -d --build

# Clean up old images
docker image prune -f
```

## Useful Commands

```bash
# View logs
docker compose logs -f app

# Restart container
docker compose restart

# Stop container
docker compose down

# Check container status
docker compose ps

# Execute commands inside container
docker exec -it plusdate-spa sh
```

## Troubleshooting

### Container won't start
```bash
docker compose logs app
```

### Port already in use
```bash
sudo lsof -i :80
```

### Environment variables not applied
After changing .env, you must rebuild:
```bash
docker compose up -d --build
```

## Important Notes

1. **.env is on HOST** - The `.env` file lives at `/opt/plusdate-spa/.env` on your server
2. **Build-time variables** - Vite env vars are baked into the JavaScript bundle during build
3. **Rebuild required** - Any .env changes require a rebuild
4. **Auto-restart** - Container automatically starts on server boot (`restart: unless-stopped`)
5. **Security** - Never commit `.env` to git