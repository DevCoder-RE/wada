# WADA BMAD - Athlete Supplement Safety Application

A dual-platform MVP application for athletes to ensure supplement and medication safety through barcode scanning, secure logging, and educational resources.

## Features

- **Barcode Scanner**: Scan supplement barcodes for instant verification against certification databases
- **Secure Logbook**: Track supplement and medication history with compliance monitoring
- **Educational Content**: Access information about supplement safety and WADA compliance
- **Offline Support**: Progressive Web App (PWA) with offline functionality

## Tech Stack

| Category   | Technology                                   |
| ---------- | -------------------------------------------- |
| Frontend   | React 18, React Router 6, Vite, Tailwind CSS |
| Backend    | Supabase (PostgreSQL 17, Auth, Realtime)     |
| Mobile     | Flutter (planned)                            |
| Monorepo   | Nx 21.4.1                                    |
| Testing    | Jest, React Testing Library                  |
| Deployment | Vercel, Docker, Coolify                      |

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+ or Yarn
- Docker (for local Supabase)
- Supabase CLI

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd wada-bmad

# Install dependencies
npm install

# Start local Supabase
cd supabase && supabase start && cd ..

# Apply migrations
cd supabase && supabase db push && cd ..

# Start development server
npm run dev
```

Access the application at http://localhost:3000

## Project Structure

```
wada-bmad/
├── apps/
│   └── web-pwa/              # React PWA application
├── libs/
│   ├── api-client/           # Supabase API client
│   ├── types/                # TypeScript types
│   ├── ui-components/       # Shared UI components
│   └── utils/               # Utility functions
├── supabase/
│   ├── migrations/            # Database migrations
│   └── config.toml           # Supabase configuration
├── docs/
│   ├── installation.md       # Installation guide
│   ├── configuration.md      # Configuration guide
│   ├── setup.md             # Setup procedures
│   ├── usage.md             # Usage guide
│   ├── uat-guide.md         # UAT procedures
│   └── api/                 # API documentation
└── flutter/                  # Flutter mobile app (planned)
```

## Documentation

| Document                                                              | Description               |
| --------------------------------------------------------------------- | ------------------------- |
| [Installation Guide](docs/installation.md)                            | Prerequisites and setup   |
| [Configuration Guide](docs/configuration.md)                          | Environment configuration |
| [Setup Guide](docs/setup.md)                                          | Database and build setup  |
| [Usage Guide](docs/usage.md)                                          | Application walkthrough   |
| [UAT Guide](docs/uat-guide.md)                                        | Testing procedures        |
| [Certification API Research](docs/api/certification-apis-research.md) | External API analysis     |

## Available Scripts

```bash
# Development
npm run dev              # Start development server

# Building
npm run build            # Production build

# Testing
npm run test             # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report

# Code Quality
npm run lint             # ESLint
npm run typecheck        # TypeScript check

# Database (in supabase directory)
supabase start           # Start local Supabase
supabase db push         # Apply migrations
supabase db reset        # Reset database with seed
```

## Test Barcodes

For testing without physical products:

| Barcode        | Product              | Status      |
| -------------- | -------------------- | ----------- |
| `123456789012` | Whey Protein Isolate | ✅ Verified |
| `123456789013` | Creatine Monohydrate | ✅ Verified |
| `123456789014` | BCAA Complex         | ✅ Verified |
| `123456789015` | Multivitamin         | ✅ Verified |
| `123456789016` | Fish Oil             | ✅ Verified |

## Test Accounts

| Email            | Password | Role    |
| ---------------- | -------- | ------- |
| test@athlete.com | Test123! | Athlete |
| coach@test.com   | Test123! | Coach   |

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "feat: add new feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

## Version

Current version: **v0.5.0-beta**

See [CHANGELOG](docs/changelog.md) for version history.

## License

Proprietary - All rights reserved

## Support

- Documentation: See `/docs` directory
- Issues: GitHub Issues
- Email: [support@example.com]
