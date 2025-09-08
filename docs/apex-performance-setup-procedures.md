# Apex Performance Brownfield Setup Procedures & Infrastructure Sequencing

## Introduction

This document provides comprehensive setup procedures and infrastructure sequencing for the Apex Performance MVP project. It reflects the actual brownfield state of the codebase, including technical debt, workarounds, and real-world patterns discovered during analysis.

### Document Scope

**Focus Areas:**

- Project scaffolding and environment setup
- Dependency installation and configuration
- Database schema creation and migration
- API configuration and deployment
- CI/CD pipeline setup
- Development workflow establishment

**Current Project State:**

- Nx monorepo with React Web PWA (Flutter mobile app planned)
- Supabase backend with PostgreSQL database
- Shared TypeScript libraries for API client, types, UI components, and utilities
- Database schema with athlete profiles, supplements, certifications, and logbook entries
- Row Level Security (RLS) policies implemented

### Change Log

| Date       | Version | Description                         | Author          |
| ---------- | ------- | ----------------------------------- | --------------- |
| 2025-09-07 | 1.0     | Initial brownfield setup procedures | Architect Agent |

## 1. Prerequisites & Environment Setup

### System Requirements

**Minimum Hardware:**

- 8GB RAM (16GB recommended)
- 20GB free disk space
- Intel/AMD x64 processor

**Supported Operating Systems:**

- macOS 12+ (Intel/Apple Silicon)
- Windows 10/11 (WSL2 recommended)
- Ubuntu 20.04+ / Debian 11+

### Required Software

```bash
# Node.js and npm (LTS version)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Nx CLI
npm install -g nx

# Supabase CLI
npm install -g supabase

# Git
sudo apt-get install -y git

# Docker (for local Supabase)
sudo apt-get install -y docker.io docker-compose
```

### Environment Variables Setup

Create `.env.local` file in project root:

```bash
# Copy from .env template
cp .env .env.local

# Edit with your values
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase (local development)
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

## 2. Project Scaffolding & Repository Setup

### Step 1: Clone and Initialize Repository

```bash
# Clone the repository
git clone <repository-url> apex-performance
cd apex-performance

# Install root dependencies
npm install

# Initialize Nx workspace
npx nx reset
```

### Step 2: Verify Project Structure

Expected structure after cloning:

```
apex-performance/
├── apps/
│   └── web-pwa/           # React PWA application
├── libs/                  # Shared libraries
│   ├── api-client/        # Supabase API client
│   ├── types/            # TypeScript type definitions
│   ├── ui-components/    # Reusable React components
│   └── utils/            # Utility functions
├── supabase/             # Database configuration
│   ├── migrations/       # Database schema files
│   └── config.toml       # Supabase configuration
├── docs/                 # Documentation
├── nx.json              # Nx workspace configuration
├── package.json         # Root dependencies
└── tsconfig.base.json   # Base TypeScript configuration
```

### Step 3: Install Dependencies

```bash
# Install all workspace dependencies
npm install

# Verify Nx can see all projects
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

## 3. Database Setup & Configuration

### Step 1: Start Local Supabase

```bash
# Navigate to supabase directory
cd supabase

# Start Supabase local development environment
supabase start

# Verify services are running
supabase status
```

Expected output:

```
supabase local development setup is running.

API URL: http://localhost:54321
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
Inbucket URL: http://localhost:54324
```

### Step 2: Run Database Migrations

```bash
# Apply database schema migrations
supabase db push

# Seed initial data (if seed.sql exists)
supabase db reset
```

### Step 3: Verify Database Schema

Connect to local database and verify tables:

```sql
-- Connect to database
psql postgresql://postgres:postgres@localhost:54322/postgres

-- List all tables
\dt

-- Expected tables:
-- athlete_profiles
-- supplements
-- ingredients
-- certifications
-- supplement_certifications
-- logbook_entries
-- user_preferences
```

### Step 4: Configure Row Level Security

RLS policies are automatically applied via migrations. Verify:

```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

## 4. Development Environment Setup

### Step 1: Build Shared Libraries

```bash
# Build all libraries in dependency order
npx nx build types
npx nx build utils
npx nx build api-client
npx nx build ui-components
```

### Step 2: Configure API Client

Update `libs/api-client/src/config.ts`:

```typescript
export const config = {
  supabaseUrl: process.env.SUPABASE_URL || 'http://localhost:54321',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
};
```

### Step 3: Start Development Server

```bash
# Start web PWA in development mode
npx nx serve web-pwa

# Server will be available at http://localhost:3000
```

### Step 4: Verify Application Startup

1. Open browser to `http://localhost:3000`
2. Check browser console for errors
3. Verify Supabase connection status
4. Test basic navigation between pages

## 5. API Configuration & Backend Setup

### Step 1: Vercel API Routes Setup

**Note:** API routes are currently not implemented. Create basic structure:

```bash
# Create API directory structure
mkdir -p apps/web-pwa/src/pages/api

# Create basic API route template
# apps/web-pwa/src/pages/api/health.ts
export default function handler(req, res) {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
}
```

### Step 2: Environment Variables for Production

Create production environment configuration:

```bash
# .env.production
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# Vercel environment variables (set in Vercel dashboard)
VERCEL_URL=your-vercel-deployment-url
```

### Step 3: Supabase Production Setup

```bash
# Login to Supabase
supabase login

# Link to production project
supabase link --project-ref your-project-id

# Push schema to production
supabase db push

# Deploy edge functions (if any)
supabase functions deploy
```

## 6. Deployment Procedures

### Step 1: Vercel Deployment Setup

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Initialize Vercel project
cd apps/web-pwa
vercel

# Follow prompts to configure deployment
```

### Step 2: Configure Build Settings

Create `vercel.json` in web-pwa directory:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "installCommand": "npm install",
  "framework": "react",
  "env": {
    "SUPABASE_URL": "@supabase-url",
    "SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

### Step 3: Deploy to Production

```bash
# Deploy to production
vercel --prod

# Or deploy preview
vercel
```

### Step 4: Domain Configuration

```bash
# Add custom domain
vercel domains add your-domain.com

# Configure DNS records as instructed
```

## 7. CI/CD Pipeline Setup

### Step 1: GitHub Actions Configuration

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Step 2: Configure Repository Secrets

In GitHub repository settings, add:

- `VERCEL_TOKEN`: Vercel authentication token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID

### Step 3: Supabase CI/CD Integration

```yaml
# Add to GitHub Actions workflow
- name: Setup Supabase
  uses: supabase/setup-cli@v1
  with:
    version: latest

- name: Push database changes
  run: supabase db push
  env:
    SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

## 8. Testing Infrastructure Setup

### Step 1: Unit Testing Configuration

```bash
# Run tests for all projects
npm run test

# Run tests for specific library
npx nx test api-client

# Run tests with coverage
npx nx test web-pwa --coverage
```

### Step 2: Integration Testing Setup

Create integration test configuration:

```typescript
// apps/web-pwa/src/test/integration/setup.ts
import { createClient } from '@supabase/supabase-js';

export const createTestClient = () => {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );
};
```

### Step 3: E2E Testing with Cypress

```bash
# Install Cypress
npm install -D cypress

# Initialize Cypress
npx cypress install

# Run E2E tests
npx cypress run
```

## 9. Monitoring & Observability Setup

### Step 1: Vercel Analytics

Vercel Analytics is automatically enabled. Access at:

- Production: `https://vercel.com/your-project/analytics`
- Development: Check Vercel dashboard

### Step 2: Supabase Monitoring

Access Supabase dashboard at:

- Local: `http://localhost:54323`
- Production: `https://supabase.com/dashboard/project/your-project`

### Step 3: Error Tracking Setup

```bash
# Install Sentry
npm install @sentry/react @sentry/tracing

# Configure Sentry in main app
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

## 10. Security Configuration

### Step 1: Environment Variables Security

```bash
# Never commit secrets to git
echo ".env*" >> .gitignore

# Use Vercel secrets for production
vercel secrets add supabase-anon-key
vercel secrets add supabase-service-role-key
```

### Step 2: CORS Configuration

Update `supabase/config.toml`:

```toml
[api]
enabled = true
cors_allowed_origins = ["http://localhost:3000", "https://your-domain.com"]
```

### Step 3: SSL/TLS Setup

Vercel automatically provides SSL certificates for custom domains.

## 11. Performance Optimization

### Step 1: Build Optimization

```bash
# Enable build optimizations
npx nx build web-pwa --configuration=production

# Analyze bundle size
npm install -D webpack-bundle-analyzer
npx nx build web-pwa --stats-json
npx webpack-bundle-analyzer dist/apps/web-pwa/stats.json
```

### Step 2: Database Optimization

```sql
-- Add performance indexes
CREATE INDEX CONCURRENTLY idx_logbook_entries_athlete_timestamp
ON logbook_entries(athlete_id, timestamp DESC);

-- Analyze query performance
EXPLAIN ANALYZE
SELECT * FROM logbook_entries
WHERE athlete_id = $1
ORDER BY timestamp DESC
LIMIT 10;
```

### Step 3: CDN Configuration

Vercel automatically serves static assets via CDN. Configure cache headers:

```typescript
// In API routes
res.setHeader('Cache-Control', 'public, max-age=3600');
```

## 12. Troubleshooting & Common Issues

### Issue 1: Supabase Connection Failed

**Symptoms:** API calls return connection errors

**Solution:**

```bash
# Check Supabase status
supabase status

# Restart Supabase
supabase stop
supabase start

# Verify environment variables
echo $SUPABASE_URL
```

### Issue 2: Build Failures

**Symptoms:** Nx build commands fail

**Solution:**

```bash
# Clear Nx cache
npx nx reset

# Reinstall dependencies
rm -rf node_modules
npm install

# Check TypeScript errors
npx tsc --noEmit
```

### Issue 3: Database Migration Errors

**Symptoms:** `supabase db push` fails

**Solution:**

```bash
# Reset database
supabase db reset

# Check migration files
ls supabase/migrations/

# Verify SQL syntax
psql -f supabase/migrations/20240907000001_initial_schema.sql
```

## 13. Development Workflow

### Daily Development Cycle

```bash
# Start development environment
supabase start
npm run dev

# Make changes to code
# Test changes locally
npm run test

# Commit changes
git add .
git commit -m "feat: implement barcode scanning"

# Push to trigger CI/CD
git push origin main
```

### Code Quality Checks

```bash
# Run linting
npm run lint

# Run type checking
npm run typecheck

# Run tests
npm run test

# Build production bundle
npm run build
```

## 14. Scaling Considerations

### Database Scaling

- Monitor connection pool usage
- Implement database read replicas for heavy read loads
- Consider database sharding for multi-region deployment

### Application Scaling

- Implement caching layers (Redis/Memcached)
- Use CDN for static assets
- Consider microservices architecture for high-traffic features

### Infrastructure Scaling

- Vercel automatically scales serverless functions
- Supabase provides auto-scaling for database
- Monitor costs and usage patterns

## 15. Backup & Recovery

### Database Backups

```bash
# Create manual backup
supabase db dump > backup.sql

# Restore from backup
supabase db reset
psql -f backup.sql
```

### Code Repository

```bash
# Backup repository
git bundle create repo-backup.bundle --all

# Restore repository
git clone repo-backup.bundle restored-repo
```

## Success Criteria

- [ ] Project successfully cloned and dependencies installed
- [ ] Local Supabase environment running with all tables created
- [ ] Web PWA application starts without errors
- [ ] Database migrations applied successfully
- [ ] Basic CRUD operations working through API
- [ ] CI/CD pipeline configured and functional
- [ ] Production deployment successful
- [ ] Monitoring and logging operational
- [ ] Security configurations applied
- [ ] Performance benchmarks met

## Next Steps

1. **Complete Flutter Mobile App**: Implement the mobile application using shared API client
2. **API Development**: Build comprehensive REST API endpoints
3. **Certification Integration**: Implement real certification database APIs
4. **Testing Expansion**: Add comprehensive test coverage
5. **Performance Monitoring**: Implement advanced monitoring and alerting
6. **Security Audit**: Conduct thorough security assessment
7. **Documentation**: Create user and developer documentation

This setup procedure provides a solid foundation for the Apex Performance MVP development and deployment.</content>
</xai:function_call
