# Apex Performance - Coolify Deployment Guide

This guide provides step-by-step instructions for deploying the Apex Performance application to Coolify using the full self-hosted Supabase stack.

## 🏗️ Architecture Overview

The deployment includes the following services:

- **PostgreSQL Database** - Primary data storage
- **Supabase REST API** - RESTful API endpoints
- **Supabase Auth** - Authentication service
- **Supabase Storage** - File storage service
- **Supabase Realtime** - Real-time subscriptions
- **Supabase Studio** - Database management UI
- **Apex Performance Web** - React PWA application
- **Nginx** - Reverse proxy and load balancer

## 📋 Prerequisites

- Coolify server installed and running
- Docker and Docker Compose available
- Git repository access
- Domain name (optional but recommended)

## 🚀 Quick Deployment

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd wada-bmad

# Copy environment template
cp .env.production .env.production.local

# Edit environment variables
nano .env.production.local
```

### 2. Configure Environment Variables

Edit `.env.production.local` with your production values:

```bash
# Database Configuration
DB_PASSWORD=your-secure-database-password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters-long
SECRET_KEY_BASE=your-secret-key-base-for-realtime-service

# Supabase Configuration
SUPABASE_URL=https://your-coolify-domain.com
SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# Application Configuration
SITE_URL=https://your-coolify-domain.com
NODE_ENV=production

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key

# Email Configuration (Optional)
ENABLE_EMAIL=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_ADMIN_EMAIL=admin@your-domain.com
```

### 3. Deploy Using Script

```bash
# Make script executable and run
chmod +x deploy-coolify.sh
./deploy-coolify.sh
```

Or deploy manually:

```bash
# Build web application
docker build -f Dockerfile.web -t apex-performance-web:latest .

# Start all services
docker-compose -f coolify-deployment.yml up -d

# Check service health
docker-compose -f coolify-deployment.yml ps
```

## 🔧 Manual Coolify Setup

### Step 1: Create Coolify Project

1. Log into your Coolify dashboard
2. Create a new project
3. Connect your Git repository

### Step 2: Configure Environment Variables

In Coolify, add these environment variables:

```
# Database
DB_PASSWORD=apex_secure_password_2024

# JWT & Security
JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters-long
SECRET_KEY_BASE=your-secret-key-base-for-realtime-service

# Supabase
SUPABASE_URL=https://your-app.coolify-domain.com
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application
SITE_URL=https://your-app.coolify-domain.com
NODE_ENV=production
GEMINI_API_KEY=your_gemini_api_key
```

### Step 3: Deploy Services

Create the following services in Coolify:

#### PostgreSQL Database

- **Service Type:** PostgreSQL
- **Version:** 15
- **Environment Variables:** `DB_PASSWORD`
- **Volume:** `postgres_data`

#### Supabase Services

Create separate services for each Supabase component:

1. **REST API**
   - Image: `supabase/postgrest:v12.0.2`
   - Environment: REST API configuration

2. **Auth**
   - Image: `supabase/gotrue:v2.151.0`
   - Environment: Auth configuration

3. **Storage**
   - Image: `supabase/storage-api:v1.0.6`
   - Environment: Storage configuration

4. **Realtime**
   - Image: `supabase/realtime:v2.28.32`
   - Environment: Realtime configuration

5. **Studio** (Optional)
   - Image: `supabase/studio:latest`
   - Environment: Studio configuration

#### Web Application

- **Build Context:** `.`
- **Dockerfile:** `Dockerfile.web`
- **Port:** `80`
- **Health Check:** `/health`

## 🌐 Domain Configuration

### 1. DNS Setup

Point your domain to your Coolify server:

```
your-app.com     A     YOUR_COOLIFY_IP
api.your-app.com CNAME your-app.com
```

### 2. Coolify Domain Configuration

In Coolify, configure domains for each service:

- **Main App:** `https://your-app.com`
- **API:** `https://api.your-app.com`

## 🔒 SSL Configuration

Coolify automatically handles SSL certificates. Ensure:

1. Domains are properly configured
2. SSL certificates are issued
3. HTTPS redirect is enabled

## 📊 Monitoring & Maintenance

### Health Checks

```bash
# Check all services
docker-compose -f coolify-deployment.yml ps

# View logs
docker-compose -f coolify-deployment.yml logs -f

# Check specific service
docker-compose -f coolify-deployment.yml logs web
```

### Database Maintenance

```bash
# Backup database
docker-compose -f coolify-deployment.yml exec db pg_dump -U postgres postgres > backup.sql

# Access database
docker-compose -f coolify-deployment.yml exec db psql -U postgres -d postgres
```

### Updates

```bash
# Update all services
docker-compose -f coolify-deployment.yml pull
docker-compose -f coolify-deployment.yml up -d

# Update specific service
docker-compose -f coolify-deployment.yml up -d web
```

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Failed

```bash
# Check database logs
docker-compose -f coolify-deployment.yml logs db

# Verify database is running
docker-compose -f coolify-deployment.yml exec db pg_isready -U postgres
```

#### API Not Responding

```bash
# Check API logs
docker-compose -f coolify-deployment.yml logs rest

# Test API endpoint
curl http://localhost:54321/rest/v1/
```

#### Web App Not Loading

```bash
# Check web app logs
docker-compose -f coolify-deployment.yml logs web

# Verify build
docker-compose -f coolify-deployment.yml exec web ls -la /usr/share/nginx/html
```

### Environment Variables

Ensure all required environment variables are set:

```bash
# Check environment variables
docker-compose -f coolify-deployment.yml exec web env | grep SUPABASE
```

## 🔧 Advanced Configuration

### Custom Nginx Configuration

Edit `nginx.conf` for custom routing, rate limiting, or security rules.

### Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_logbook_entries_user_timestamp
ON logbook_entries(athlete_id, timestamp DESC);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM logbook_entries WHERE athlete_id = $1;
```

### Backup Strategy

```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose -f coolify-deployment.yml exec -T db pg_dump -U postgres postgres > "backup_$DATE.sql"
# Upload to cloud storage
```

## 📞 Support

For issues or questions:

1. Check the logs: `docker-compose -f coolify-deployment.yml logs`
2. Verify environment variables
3. Test individual services
4. Check Coolify documentation
5. Review Supabase documentation

## 🔄 Migration from Development

When migrating from local development:

1. Update all URLs in environment variables
2. Generate new JWT secrets
3. Configure production database credentials
4. Set up monitoring and alerts
5. Configure backup procedures
6. Test all functionality in production environment
