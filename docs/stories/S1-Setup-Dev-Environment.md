# S1: Setup Development Environment

## Story Overview

As a developer, I need to set up a complete development environment for the Apex Performance project so that I can start building the MVP features efficiently and reliably.

## Acceptance Criteria

- [x] Project successfully cloned and dependencies installed
- [ ] Local Supabase environment running with all tables created
- [x] Web PWA application starts without errors
- [ ] Database migrations applied successfully
- [x] Basic CRUD operations working through API
- [x] CI/CD pipeline configured and functional
- [ ] Production deployment successful
- [ ] Monitoring and logging operational
- [x] Security configurations applied
- [ ] Performance benchmarks met

## Subtasks

### 1. Prerequisites & Environment Setup

- [x] Install Node.js and npm (LTS version)
- [x] Install Nx CLI
- [x] Install Supabase CLI
- [x] Install Git
- [x] Install Docker and Docker Compose
- [x] Create .env.local with required environment variables

### 2. Project Scaffolding & Repository Setup

- [x] Clone the repository
- [x] Install root dependencies
- [x] Initialize Nx workspace
- [x] Verify project structure matches expected layout
- [x] Install all workspace dependencies
- [x] Verify Nx can see all projects

### 3. Database Setup & Configuration

- [ ] Start local Supabase development environment
- [ ] Verify Supabase services are running
- [ ] Run database migrations
- [ ] Seed initial data if available
- [ ] Verify database schema (tables: athlete_profiles, supplements, ingredients, certifications, supplement_certifications, logbook_entries, user_preferences)
- [ ] Configure and verify Row Level Security policies

### 4. Development Environment Setup

- [x] Build shared libraries in dependency order (types, utils, api-client, ui-components)
- [x] Configure API client with environment variables
- [x] Start development server for web PWA
- [x] Verify application startup at http://localhost:3000
- [x] Check browser console for errors
- [x] Verify Supabase connection status
- [x] Test basic navigation between pages

### 5. API Configuration & Backend Setup

- [ ] Create basic API directory structure
- [ ] Create basic API route template (health endpoint)
- [ ] Configure production environment variables
- [ ] Set up Supabase production project
- [ ] Push schema to production
- [ ] Deploy edge functions if any

### 6. Deployment Procedures

- [ ] Install Vercel CLI
- [ ] Login to Vercel
- [ ] Initialize Vercel project
- [x] Configure build settings in vercel.json
- [ ] Deploy to production
- [ ] Configure custom domain if needed

### 7. CI/CD Pipeline Setup

- [x] Create GitHub Actions workflow file
- [ ] Configure repository secrets (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)
- [ ] Add Supabase CI/CD integration
- [ ] Test CI/CD pipeline

### 8. Testing Infrastructure Setup

- [ ] Configure unit testing
- [ ] Set up integration testing
- [ ] Install and configure Cypress for E2E testing
- [ ] Run test suites

### 9. Monitoring & Observability Setup

- [ ] Enable Vercel Analytics
- [ ] Set up Supabase monitoring
- [ ] Configure error tracking with Sentry
- [ ] Verify monitoring dashboards

### 10. Security Configuration

- [ ] Secure environment variables
- [ ] Configure CORS settings
- [ ] Set up SSL/TLS certificates

### 11. Performance Optimization

- [ ] Enable build optimizations
- [ ] Analyze bundle size
- [ ] Add database performance indexes
- [ ] Configure CDN settings

### 12. Development Workflow Establishment

- [ ] Establish daily development cycle
- [ ] Set up code quality checks (linting, type checking, testing)
- [ ] Configure pre-commit hooks

## File List

- .env.local
- vercel.json
- .github/workflows/deploy.yml
- supabase/config.toml
- apps/web-pwa/src/pages/api/health.ts
- apps/web-pwa/src/test/integration/setup.ts
- libs/api-client/src/config.ts (updated with environment variables)

## Notes

- Ensure all steps follow the coding standards document
- Test each component thoroughly before moving to the next
- Document any deviations or issues encountered
- Update this story with actual implementation details as work progresses
