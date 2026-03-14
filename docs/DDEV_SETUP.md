# DDEV Setup Guide

## Prerequisites

- [DDEV](https://ddev.readthedocs.io/en/stable/) installed on your system
- Docker Desktop or compatible Docker environment

## Quick Start with DDEV

### 1. Start DDEV

```bash
ddev start
```

This will:
- Create and start Docker containers
- Install npm dependencies automatically
- Copy `.env.example` to `.env.local`
- Set up Node.js 20 environment

### 2. Access the Application

The Next.js dev server starts automatically! The application is available at:
- **Main URL**: `https://english-tracker-app.ddev.site`
- **HTTP**: `http://english-tracker-app.ddev.site:33000` (if port 80 is busy)
- **Direct Node**: `https://english-tracker-app.ddev.site:3001`

To see all available URLs:
```bash
ddev describe
```

### 3. Manually Restart Next.js (if needed)

If you need to restart the Next.js server:
```bash
ddev exec bash /var/www/html/.ddev/web-build/start-nextjs.sh
```

Or manually:
```bash
ddev exec "pkill -f 'next dev' && npm run dev > /tmp/nextjs.log 2>&1 &"
```

### 4. Run Commands Inside DDEV

```bash
# SSH into the container
ddev ssh

# Run npm commands
ddev exec npm run dev
ddev exec npm run build
ddev exec npm install <package-name>

# View logs
ddev logs

# Restart services
ddev restart

# Stop DDEV
ddev stop

# Remove DDEV containers
ddev delete
```

## Configuration

### Environment Variables

Edit `.env.local` inside the DDEV container:

```bash
ddev ssh
nano .env.local
```

Or edit from your host machine:

```bash
# .env.local will be in your project root
nano .env.local
```

Required variables:
```env
AI_API_KEY=your_api_key_here
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4.1-mini
```

### Node.js Version

The project uses Node.js 20. This is configured in `.ddev/config.yaml`:

```yaml
nodejs_version: "20"
```

To change the version, edit `.ddev/config.yaml` and restart:

```bash
ddev restart
```

## Development Workflow

### Starting Development

```bash
# Start DDEV (automatically installs dependencies and starts Next.js)
ddev start

# Access: https://english-tracker-app.ddev.site
```

The Next.js dev server starts automatically via post-start hooks!

### Viewing Next.js Logs

```bash
# View logs
ddev exec tail -f /tmp/nextjs.log

# Check if Next.js is running
ddev exec "curl -s http://localhost:3000 && echo 'Next.js is running'"
```

### Installing Dependencies

```bash
# Add a new package
ddev exec npm install <package-name>

# Or use the shorthand
ddev npm install <package-name>
```

### Running Scripts

```bash
# Development mode (already running)
ddev exec npm run dev

# Build for production
ddev exec npm run build

# Start production server
ddev exec npm start
```

### Viewing Logs

```bash
# Container logs
ddev logs

# Follow logs in real-time
ddev logs -f

# Next.js logs
ddev exec npm run dev
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

1. Edit `.ddev/config.yaml`
2. Change the `container_port` under `web_extra_exposed_ports`
3. Restart: `ddev restart`

### Dependencies Not Installing

```bash
# Force reinstall
ddev exec rm -rf node_modules package-lock.json
ddev exec npm install
```

### Container Won't Start

```bash
# Remove and recreate
ddev delete -O
ddev start
```

### Permission Issues

```bash
# Fix permissions
ddev exec sudo chown -R $(id -u):$(id -g) node_modules
```

### Environment Variables Not Loading

```bash
# Verify .env.local exists
ddev exec ls -la .env.local

# Recreate if needed
ddev exec cp .env.example .env.local
ddev restart
```

## Advanced Configuration

### Custom Docker Compose

Edit `.ddev/docker-compose.node.yaml` to customize:
- Environment variables
- Mounted volumes
- Exposed ports
- Node commands

### Post-Start Hooks

DDEV runs these commands automatically after starting (configured in `.ddev/config.yaml`):

```yaml
hooks:
  post-start:
    - exec: npm install
    - exec: cp .env.example .env.local || true
```

### Database Setup (Optional)

This project doesn't require a database by default, but if you need one:

```bash
# Edit .ddev/config.yaml
database:
  type: "mysql"
  version: "8.0"

# Restart
ddev restart
```

## DDEV Commands Reference

```bash
# Project management
ddev start          # Start containers
ddev stop           # Stop containers
ddev restart        # Restart containers
ddev delete         # Remove containers
ddev poweroff       # Stop all DDEV projects

# Access
ddev ssh            # SSH into web container
ddev describe       # Show project info and URLs

# Logs and debugging
ddev logs           # View logs
ddev logs -f        # Follow logs
ddev snapshot       # Create database snapshot

# Commands
ddev exec <cmd>     # Run command in container
ddev npm <cmd>      # Run npm command
```

## Benefits of Using DDEV

1. **Consistent Environment**: Same setup across all developers
2. **Isolated**: Doesn't interfere with host system
3. **Easy Setup**: One command to start everything
4. **Automatic Dependencies**: npm install runs automatically
5. **Port Management**: No conflicts with other local projects
6. **Easy Sharing**: Share DDEV config with team

## Switching Between DDEV and Local

### Using DDEV
```bash
ddev start
# Access: http://english-tracker-app.ddev.site:3000
```

### Using Local Node
```bash
ddev stop
npm install
npm run dev
# Access: http://localhost:3000
```

Both methods work independently.

## CI/CD Integration

DDEV is for local development only. For production:

```bash
# Build normally
npm install
npm run build
npm start
```

DDEV containers are not used in production deployments.

---

**Need Help?** Run `ddev help` or visit [DDEV Documentation](https://ddev.readthedocs.io/)
