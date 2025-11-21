# Pet App

A backend application built with Node.js, TypeScript, and PostgreSQL following Domain-Driven Design (DDD) architecture principles.

## Features

- **Domain-Driven Design Architecture**: Clean separation between domain, application, infrastructure, and presentation layers
- **TypeScript**: Full type safety with strict mode enabled
- **PostgreSQL**: Robust relational database with Docker support
- **TypeORM**: Type-safe database operations with migrations
- **UUIDv7**: Time-ordered identifiers for better database performance
- **Testing**: Jest with 80%+ coverage target
- **Code Quality**: ESLint + Prettier with TypeScript support

## Prerequisites

- Node.js >= 22.12.0
- npm >= 10.9.0
- Docker and Docker Compose
- nvm (recommended)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/anniavdc/pet-app.git
cd pet-app
```

### 2. Install Node.js version

```bash
nvm install
nvm use
```

### 3. Install dependencies

```bash
npm install
```

### 4. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration if needed.

### 5. Start PostgreSQL

```bash
docker-compose up -d
```

### 6. Run database migrations

```bash
npm run migration:run
```

### 7. Start development server

```bash
npm run dev
```

## Available Scripts

### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Run production build

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Testing
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Database
- `npm run migration:create -- -n MigrationName` - Create new migration
- `npm run migration:run` - Run pending migrations
- `npm run migration:revert` - Revert last migration
- `npm run schema:drop` - Drop database schema (dev only)

## Project Structure

```
src/
├── domain/              # Business logic and entities
│   └── entities/       # Domain entities with business rules
├── application/        # Use cases and application services
│   ├── use-cases/     # Business operations
│   └── dtos/          # Data transfer objects
├── infrastructure/     # External integrations
│   └── database/      # TypeORM configuration and repositories
│       ├── entities/  # TypeORM entities
│       ├── migrations/ # Database migrations
│       └── data-source.ts
└── presentation/       # HTTP layer (controllers, routes)
```

## Database Schema

```
┌─────────────────┐          ┌─────────────────────┐
│      PET        │          │       WEIGHT        │
├─────────────────┤          ├─────────────────────┤
│ id (uuid) PK    │──────┐   │ id (uuid) PK        │
│ name (varchar)  │      └──<│ pet_id (uuid) FK    │
└─────────────────┘          │ weight (float)      │
                             │ date (date)         │
                             └─────────────────────┘
```

### Pet Table
- `id` (uuid) - Primary key, UUIDv7
- `name` (varchar) - Pet name

### Weight Table
- `id` (uuid) - Primary key, UUIDv7
- `pet_id` (uuid) - Foreign key to Pet (CASCADE on delete)
- `weight` (float) - Weight value
- `date` (date) - Measurement date

## Architecture Principles

### Domain-Driven Design (DDD)

This project follows DDD principles with clear layer separation:

1. **Domain Layer**: Pure business logic, no external dependencies
2. **Application Layer**: Orchestrates use cases, coordinates domain entities
3. **Infrastructure Layer**: Database, external services, technical concerns
4. **Presentation Layer**: HTTP endpoints, request/response handling

### Key Conventions

- **UUIDv7 for IDs**: Time-ordered UUIDs for better database performance
- **Entity Validation**: All validation logic lives in domain entities
- **Repository Pattern**: Abstract data access behind interfaces
- **DTOs**: Separate input/output models from domain entities
- **Path Aliases**: Clean imports using `@domain`, `@application`, etc.

## Development Guidelines

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(scope): description
fix(scope): description
docs: description
test(scope): description
refactor(scope): description
chore: description
```

### Code Quality Standards

- **Zero ESLint errors**: Run `npm run lint:fix` before committing
- **80%+ test coverage**: Run `npm run test:coverage` to verify
- **Type safety**: Use TypeScript strict mode, avoid `any`
- **Naming conventions**: 
  - Interfaces prefixed with `I` (e.g., `IPetRepository`)
  - DTOs suffixed with `DTO` (e.g., `RegisterPetDTO`)
  - Files in kebab-case (e.g., `pet.entity.ts`)

### Pre-commit Checklist

1. Run `npm run lint:fix`
2. Run `npm run format`
3. Run `npm test`
4. Run `npm run test:coverage`
5. Review changes
6. Write conventional commit message

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Application port | `3000` |
| `DATABASE_HOST` | PostgreSQL host | `localhost` |
| `DATABASE_PORT` | PostgreSQL port | `5432` |
| `DATABASE_NAME` | Database name | `petapp` |
| `DATABASE_USER` | Database user | `petapp_user` |
| `DATABASE_PASSWORD` | Database password | `petapp_pass` |
| `TYPEORM_SYNCHRONIZE` | Auto-sync schema (dev only) | `false` |
| `TYPEORM_LOGGING` | Enable SQL logging | `true` |

## Docker

### Start Services

```bash
docker-compose up -d
```

### View Logs

```bash
docker-compose logs -f postgres
```

### Stop Services

```bash
docker-compose down
```

### Reset Database

```bash
docker-compose down -v
docker-compose up -d
npm run migration:run
```

## Contributing

1. Create a feature branch from `main`
2. Make your changes following the guidelines
3. Ensure all tests pass and coverage is maintained
4. Submit a pull request

## License

ISC
