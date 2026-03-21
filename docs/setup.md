# Setup Guide

Complete setup procedures for the WADA BMAD application.

---

## Quick Setup (5 Minutes)

If you already have all prerequisites installed:

```bash
# 1. Clone and enter directory
git clone <repo-url> wada-bmad
cd wada-bmad

# 2. Install dependencies
npm install

# 3. Start Supabase
cd supabase && supabase start && cd ..

# 4. Apply migrations
cd supabase && supabase db push && cd ..

# 5. Start development server
npm run dev
```

---

## Detailed Setup Procedures

### Step 1: Database Setup

#### Start Local Supabase

```bash
cd supabase

# Start all Supabase services
supabase start

# Verify services are running
supabase status
```

Expected output:

```
         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
      Inbucket URL: http://localhost:54324
```

#### Apply Migrations

```bash
# Option A: Push migrations to existing database
supabase db push

# Option B: Reset database (deletes all data)
supabase db reset
```

#### Verify Tables Created

```sql
-- Connect to database
psql postgresql://postgres:postgres@localhost:54322/postgres

-- List all tables
\dt

-- Expected tables:
-- athlete_profiles
-- certifications
-- ingredients
-- logbook_entries
-- supplements
-- supplement_certifications
-- user_preferences
-- educational_content
-- content_categories
-- affiliate_links
-- content_affiliate_links
-- user_content_engagement
-- content_analytics
-- affiliate_clicks
-- affiliate_conversions
```

---

### Step 2: Seed Data (Optional)

The seed data includes sample certifications and supplements for testing.

```bash
# Apply seed data
supabase db reset

# This will:
# 1. Run all migrations
# 2. Apply seed.sql
# 3. Create test data
```

**Seeded Data:**

| Type           | Count | Details                              |
| -------------- | ----- | ------------------------------------ |
| Certifications | 4     | NSF, Informed Sport, ISO 17025, WADA |
| Supplements    | 5     | Test products with barcodes          |
| Ingredients    | 12    | Supplement ingredients               |

---

### Step 3: Build Shared Libraries

```bash
# From project root, build in dependency order
npx nx build types
npx nx build utils
npx nx build api-client
npx nx build ui-components
```

Each build should complete without errors.

---

### Step 4: Verify TypeScript Configuration

```bash
# Type check the entire workspace
npx nx run-many --target=typecheck

# Or check specific project
npx nx typecheck web-pwa
```

---

### Step 5: Start Development Server

```bash
# Start with hot reload
npm run dev

# Or explicitly
npx nx serve web-pwa
```

The application will be available at http://localhost:3000

---

### Step 6: Verify Application

1. **Open Browser**
   Navigate to http://localhost:3000

2. **Sign Up**
   Click "Sign up" and create a test account

3. **Verify Dashboard**
   - Should see welcome message
   - Quick actions should be visible
   - Empty recent activity

4. **Test Scanner**
   - Navigate to Scanner
   - Camera permission prompt should appear
   - Test barcode: `123456789012`

5. **Test Logbook**
   - Navigate to Logbook
   - Should see empty state or entries
   - Test add entry functionality

6. **Test Education**
   - Navigate to Education
   - Should see static content and dynamic articles (if seeded)

---

## Production Setup

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Verify build output
ls -la dist/apps/web-pwa/
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy preview
vercel

# Deploy production
vercel --prod
```

### Deploy to Coolify

1. Connect repository to Coolify
2. Configure build command: `npm run build`
3. Configure start command: `npm run start`
4. Set environment variables

### Deploy with Docker

```bash
# Build image
docker build -f Dockerfile.web -t wada-bmad:latest .

# Run container
docker run -p 3000:80 wada-bmad:latest

# Or with docker-compose
docker-compose up -d
```

---

## Verification Checklist

Run through this checklist to verify successful setup:

### Core Functionality

- [ ] Application starts without errors
- [ ] Sign up / Sign in works
- [ ] Dashboard loads with user data
- [ ] Profile page accessible and editable
- [ ] Logout works

### Scanner

- [ ] Camera access works
- [ ] Barcode scanning initializes
- [ ] Test barcode `123456789012` returns verified result
- [ ] Unknown barcode shows "not found"

### Logbook

- [ ] Empty state displays correctly
- [ ] Add entry form works
- [ ] Entries persist after page refresh
- [ ] Search/filter functionality works
- [ ] Delete entry works
- [ ] Compliance summary displays

### Education

- [ ] Page loads without errors
- [ ] Static content displays
- [ ] Dynamic content (if seeded) displays
- [ ] External links work

### Database

- [ ] Supabase Studio accessible at http://localhost:54323
- [ ] Tables created correctly
- [ ] RLS policies in place
- [ ] Seed data applied (if using)

---

## Troubleshooting

### Database Connection Issues

**Symptom:** "Failed to connect to database"

**Solution:**

```bash
# Check Supabase is running
supabase status

# Restart Supabase
supabase stop
supabase start

# Verify connection
psql postgresql://postgres:postgres@localhost:54322/postgres -c "SELECT 1"
```

### Build Failures

**Symptom:** Build fails with TypeScript errors

**Solution:**

```bash
# Clear Nx cache
npx nx reset

# Reinstall dependencies
rm -rf node_modules
npm install

# Type check
npx tsc --noEmit
```

### Port Conflicts

**Symptom:** "Port 3000 already in use"

**Solution:**

```bash
# Find process using port
lsof -i :3000

# Kill process or use different port
npx nx serve web-pwa --port 3001
```

---

## Next Steps

After setup is complete:

1. Review [Usage Guide](usage.md) for application walkthrough
2. Review [UAT Guide](uat-guide.md) for testing procedures
3. Configure production environment variables
4. Set up CI/CD pipeline (post-UAT)

---

## Support

For setup issues:

1. Check [Installation Guide](installation.md) for prerequisites
2. Review [Configuration Guide](configuration.md) for settings
3. Contact development team with error messages
