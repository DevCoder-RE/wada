# Supabase Backend Setup for WADA BMAD

This directory contains the Supabase configuration and database schema for the WADA BMAD project, supporting both cloud and self-hosted deployments.

## Prerequisites

1. [Supabase CLI](https://supabase.com/docs/guides/cli) installed
2. Supabase account
3. Node.js and npm installed

## 1. Supabase Project Setup

### Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in project details:
   - Name: `wada-bmad`
   - Database Password: Choose a strong password
   - Region: Select closest to your users
4. Wait for project creation to complete

### Get Project Credentials

After project creation, go to Settings > API and copy:
- Project URL
- Project API Key (anon/public)
- Project API Key (service_role) - Keep this secret!

### Update Environment Variables

Update your `.env` file with the actual values:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## 1.5 Self-Hosting Option (Alternative to Cloud)

For development, testing, or privacy requirements, you can self-host Supabase locally using Docker.

### Prerequisites for Self-Hosting

1. [Docker](https://docs.docker.com/get-docker/) installed and running
2. [Supabase CLI](https://supabase.com/docs/guides/cli) installed
3. At least 4GB RAM available for Docker
4. Ports 54321-54324 available on your system

### Quick Self-Hosting Setup

1. **Run the automated setup script:**
   ```bash
   cd supabase
   ./setup.sh
   ```
   Choose option 2 (Self-hosted) when prompted.

2. **Or set up manually:**
   ```bash
   # Start local Supabase services
   supabase start

   # Apply database schema
   supabase db push

   # (Optional) Seed with sample data
   supabase db reset
   ```

3. **Update your `.env` file:**
   ```env
   SUPABASE_URL=http://localhost:54321
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
   ```

### Local Service URLs

- **API Gateway**: http://localhost:54321
- **Database**: postgresql://postgres:postgres@localhost:54322/postgres
- **Supabase Studio**: http://localhost:54323
- **Email Testing**: http://localhost:54324

### Docker Compose Alternative

You can also use the provided `docker-compose.yml` in the project root:

```bash
docker-compose up -d
```

### Stopping Local Services

```bash
supabase stop
# or
docker-compose down
```

## 2. Database Schema Setup

### Option A: Using Supabase Dashboard (Recommended for beginners)

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of each migration file in order:
   - `migrations/20240907000001_initial_schema.sql`
   - `migrations/20240907000002_rls_policies.sql`
   - `migrations/20240907000003_functions.sql`
   - `seed.sql` (optional, for sample data)

### Option B: Using Supabase CLI

```bash
# Initialize Supabase in your project
supabase init

# Link to your remote project
supabase link --project-ref your-project-id

# Apply migrations
supabase db push

# Apply seed data (optional)
supabase db reset
```

## 3. Authentication Configuration

### Configure Authentication Settings

1. Go to Authentication > Settings in your Supabase dashboard
2. Configure the following:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: Add your app's callback URLs
   - **Enable email confirmations**: Yes
   - **Enable email change confirmations**: Yes

### User Roles Setup

The system supports three user roles:
- `athlete`: Regular users who track supplements
- `coach`: Can verify athlete entries and view team data
- `admin`: Full system access

To assign roles, update user metadata in the auth.users table or use the Supabase dashboard.

## 4. Real-time Configuration

Real-time subscriptions are already configured for:
- Logbook entries updates
- Supplement verification status changes

The system uses Supabase's real-time features for live updates in the mobile and web apps.

## 5. Storage Setup (Optional)

If you need to store supplement images or documents:

1. Go to Storage in your Supabase dashboard
2. Create a bucket called `supplements`
3. Set up appropriate RLS policies for secure access

## 6. API Integration

The API client is already set up in `libs/api-client/src/index.ts`. It includes:

- Authentication services
- Database query functions
- Real-time subscriptions
- Error handling utilities

## 7. Testing the Setup

### Test Authentication

```javascript
import { AuthService } from '@wada-bmad/api-client';

// Test signup
const result = await AuthService.signUp('test@example.com', 'password123');
console.log(result);
```

### Test Database Queries

```javascript
import { DatabaseService } from '@wada-bmad/api-client';

// Test getting supplements
const supplements = await DatabaseService.getSupplements();
console.log(supplements);
```

## 8. Security Best Practices

### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:
- Athletes can only access their own data
- Coaches can access team data
- Public data (supplements, certifications) is readable by all

### API Keys

- Never commit API keys to version control
- Use environment variables for all secrets
- Rotate keys regularly
- Use service role key only for server-side operations

### Data Validation

- All database functions include input validation
- Use prepared statements to prevent SQL injection
- Validate user input on both client and server side

## 9. Monitoring and Maintenance

### Enable Supabase Analytics

1. Go to Reports in your Supabase dashboard
2. Enable analytics to monitor:
   - API usage
   - Database performance
   - Authentication metrics

### Backup Strategy

- Supabase automatically backs up your data
- Export important data regularly
- Test restore procedures

## 10. Deployment

### Production Deployment

1. Update environment variables with production URLs
2. Enable production optimizations
3. Set up monitoring and alerting
4. Configure CORS for your domain

### Environment Variables for Production

```env
SUPABASE_URL=https://your-prod-project.supabase.co
SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key
```

## Troubleshooting

### Common Issues

1. **RLS Blocking Queries**: Check your RLS policies
2. **Authentication Errors**: Verify API keys and JWT configuration
3. **Real-time Not Working**: Check WebSocket connections
4. **CORS Errors**: Add your domain to allowed origins

### Getting Help

- Check Supabase documentation: https://supabase.com/docs
- Community forums: https://github.com/supabase/supabase/discussions
- GitHub issues: https://github.com/supabase/supabase/issues

## File Structure

```
supabase/
├── config.toml              # Supabase CLI configuration
├── migrations/              # Database migrations
│   ├── 20240907000001_initial_schema.sql
│   ├── 20240907000002_rls_policies.sql
│   └── 20240907000003_functions.sql
├── seed.sql                 # Sample data
└── README.md               # This file
```