# Technical Context

## Technology Stack

### Frontend
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- PostCSS

### Backend
- Next.js API Routes
- Drizzle ORM
- Multiple AI Provider SDKs

### Development Tools
- ESLint for code linting
- Prettier for code formatting
- Docker for containerization
- TypeScript for type safety

## Development Setup
- Node.js environment
- Yarn package manager
- Docker support (Dockerfile and docker-compose)
- Environment configuration via config.toml

## Technical Constraints
- TypeScript strict mode enabled
- Next.js configuration customizations
- Docker-based deployment support
- File upload size limitations
- API rate limiting considerations

## Configuration Files
- `.eslintrc.json` - ESLint configuration
- `.prettierrc.js` - Prettier configuration
- `drizzle.config.ts` - Database configuration
- `next.config.mjs` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `sample.config.toml` - Application configuration template

## Dependencies
Package management via yarn.lock for consistent installations

## Development Workflow
1. Local development using `yarn dev`
2. Docker containerization available
3. TypeScript compilation and type checking
4. Automated code formatting and linting
5. Database migrations with Drizzle