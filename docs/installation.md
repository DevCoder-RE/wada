# Installation Guide

## Prerequisites

### System Requirements

| Requirement    | Minimum                               | Recommended                          |
| -------------- | ------------------------------------- | ------------------------------------ |
| **CPU**        | x64 processor                         | x64 processor                        |
| **RAM**        | 8 GB                                  | 16 GB                                |
| **Disk Space** | 20 GB                                 | 40 GB                                |
| **OS**         | macOS 12+, Windows 10+, Ubuntu 20.04+ | macOS 13+, Windows 11, Ubuntu 22.04+ |

### Required Software

#### 1. Node.js (v18+)

**macOS/Linux:**

```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Verify installation
node --version
# Should output: v18.x.x or higher
```

**Windows:**
Download from [nodejs.org](https://nodejs.org/) or use [nvm-windows](https://github.com/coreybutler/nvm-windows).

#### 2. npm (v9+) or Yarn (v1.22+)

npm comes bundled with Node.js. Verify:

```bash
npm --version
# Should output: 9.x.x or higher
```

#### 3. Git (v2.30+)

**macOS:**

```bash
brew install git
```

**Windows:**
Download from [git-scm.com](https://git-scm.com/download/win)

**Linux:**

```bash
sudo apt install git
```

#### 4. Docker & Docker Compose

**macOS:**

```bash
brew install --cask docker
# Then open Docker Desktop from Applications
```

**Windows:**

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Enable WSL 2 integration (recommended)

**Linux:**

```bash
sudo apt update
sudo apt install docker.io docker-compose
sudo usermod -aG docker $USER
# Log out and back in for group changes to take effect
```

#### 5. Supabase CLI (v1.120+)

```bash
# macOS
brew install supabase/tap/supabase

# Linux/Windows (WSL)
npm install -g supabase

# Verify
supabase --version
```

#### 6. Nx CLI (optional, for monorepo management)

```bash
npm install -g nx
# or use npx nx (included in project)
```

---

## Clone the Repository

```bash
# Clone the repository
git clone <repository-url> wada-bmad
cd wada-bmad

# Verify repository
ls -la
# You should see: apps/, libs/, supabase/, docs/, etc.
```

---

## Environment Setup

### 1. Copy Environment Files

```bash
# Copy development environment template
cp .env .env.local

# Copy production environment template (for deployment)
cp .env.production .env.production.local
```

### 2. Configure Environment Variables

Edit `.env.local`:

```bash
# ===========================================
# SUPABASE CONFIGURATION (Required)
# ===========================================

# Local Development (default)
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-key

# Production (uncomment and fill for production)
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your-production-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-production-service-key

# ===========================================
# API KEYS (Optional for MVP)
# ===========================================

# Gemini API (for AI features)
# GEMINI_API_KEY=your-gemini-api-key

# ===========================================
# CERTIFICATION APIs (Future - leave empty for MVP)
# ===========================================

# NSF Certified for Sport API
# NSF_API_KEY=

# Informed Sport API
# INFORMED_SPORT_API_KEY=

# Global DRO API
# GLOBAL_DRO_API_KEY=
```

---

## Install Dependencies

```bash
# From project root
npm install

# This will install:
# - Root workspace dependencies (Nx, TypeScript)
# - All workspace project dependencies
# - Supabase CLI integration
```

**Expected output:**

```
added 1500 packages in 45s

Nx detected a workspace - enabled all plugins.
```

---

## Verify Installation

### 1. Check Nx Workspace

```bash
npx nx show projects
```

Expected output:

```
api-client
types
ui-components
utils
web-pwa
```

### 2. Verify TypeScript

```bash
npx nx build types
```

### 3. Verify Shared Libraries Build

```bash
npx nx build utils
npx nx build api-client
npx nx build ui-components
```

### 4. Verify Web PWA Builds

```bash
npx nx build web-pwa
```

---

## Docker Setup (Local Supabase)

### 1. Start Local Supabase

```bash
cd supabase
supabase start
```

**Expected output:**

```
Starting local Supabase development setup.
Creating Docker volumes for persistent data
Pulling images...
Starting containers...

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
      Inbucket URL: http://localhost:54324
        anon key: eyJ...
```

### 2. Apply Database Migrations

```bash
# Push migrations to local database
supabase db push

# Or reset database with fresh migrations and seed data
supabase db reset
```

### 3. Verify Database Setup

```bash
supabase status
```

You should see all services as `Running`.

---

## First Run

### Start Development Server

```bash
# From project root
npm run dev

# Or specifically for web PWA
npx nx serve web-pwa
```

**Expected output:**

```
> nx serve web-pwa

  NX   Starting dxa.dev server for 'web-pwa'

  ✔  Browser application bundle generated
  ✔  Uglifying body { stdIn: 0, stdOut: 1, stdErr: 0, resolved: 1, rejected: 0, time: { add: 0, ends: 2113 } }
  ✔  Tailwind CSS generated
  ✔  Compiled successfully

  NX   Web PWA dev server running at http://localhost:3000
```

### Open in Browser

1. Navigate to http://localhost:3000
2. You should see the login page
3. Sign up for a new account
4. Explore the application

---

## Troubleshooting

### Issue: npm install fails

**Solution:**

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Issue: Docker containers won't start

**Solution:**

```bash
# Restart Docker
# On macOS/Windows: Restart Docker Desktop

# Or on Linux:
sudo systemctl restart docker

# Verify Docker is running
docker ps
```

### Issue: Supabase start hangs

**Solution:**

```bash
# Stop any existing containers
supabase stop

# Clean up Docker resources
docker system prune -f

# Restart
supabase start
```

### Issue: Port 3000 already in use

**Solution:**

```bash
# Find what's using port 3000
# macOS/Linux:
lsof -i :3000

# Windows:
netstat -ano | findstr :3000

# Kill the process or use a different port
npx nx serve web-pwa --port 3001
```

### Issue: TypeScript compilation errors

**Solution:**

```bash
# Clear Nx cache
npx nx reset

# Type check the project
npx nx run web-pwa:typecheck
```

---

## Next Steps

Once installation is complete, proceed to:

- [Configuration Guide](configuration.md) - Configure environment-specific settings
- [Setup Guide](setup.md) - Database and build setup
- [Usage Guide](usage.md) - Using the application
- [UAT Guide](uat-guide.md) - User acceptance testing

---

## Support

For issues or questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review existing documentation in `/docs`
3. Check GitHub Issues for similar problems
4. Contact the development team
