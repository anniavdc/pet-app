# Pet App - AI Coding Agent Instructions

## Project Overview

Node.js/TypeScript backend application following **Domain-Driven Design (DDD)** architecture with PostgreSQL database. Focus on scalability, type safety, and comprehensive testing (70%+ coverage target, currently 93.72%).

## Current Implementation Status

### Implemented Features
- ✅ **Pet Management**: Create pets with validation (2-50 chars, no whitespace-only names)
- ✅ **Weight Tracking**: Add and retrieve weight measurements for pets
- ✅ **API Endpoints**:
  - `POST /api/pets` - Create a new pet
  - `POST /api/pets/:petId/weights` - Add weight measurement (0.01-1000kg, no future dates)
  - `GET /api/pets/:petId/weights` - Retrieve weight history (ordered by date DESC)
- ✅ **API Documentation**: Interactive Swagger/OpenAPI at `/api-docs`
- ✅ **Database**: PostgreSQL with TypeORM, migrations, separate test database (port 5433)
- ✅ **Testing**: 65 tests passing, 93.72% coverage
- ✅ **Validation**: class-validator for DTOs, domain validation in entities
- ✅ **Error Handling**: Custom domain errors with proper HTTP status codes

### Database Schema
```
Pet Table:
- id (uuid PK, UUIDv7)
- name (varchar, 2-50 chars)

Weight Table:
- id (uuid PK, UUIDv7)
- pet_id (uuid FK → Pet.id, CASCADE on delete)
- weight (float, 0.01-1000)
- date (date, no future dates)
```

### Security Notes
- **Never expose actual credentials in README or documentation**
- Use placeholder examples like `your_db_name`, `your_secure_password`
- Database credentials are in `.env` and `.env.test` (gitignored)
- Docker Compose contains default dev credentials (acceptable for local dev only)

## Architecture: DDD Layers

### 1. Domain Layer (`src/domain/`)

**Core business logic - zero external dependencies**

- **Entities**: Business objects with identity (e.g., `User`, `Pet`, `Appointment`)
  - Must have unique identifiers (id)
  - Use UUIDv7 for all entity IDs (time-ordered, better performance)
  - Provide static `create()` factory methods that auto-generate UUIDv7
  - Encapsulate business rules and validation
  - Example: `Pet` entity validates age, species, and ownership
- **Value Objects**: Immutable objects without identity (e.g., `Email`, `Address`, `Money`)
  - Always validate in constructor
  - Implement equality based on attributes
- **Domain Services**: Business operations spanning multiple entities
- **Repository Interfaces**: Define contracts for data persistence (implementations live in infrastructure)

```typescript
// Example Domain Entity Pattern with UUIDv7
import { uuidv7 } from 'uuidv7';

export class Pet {
  constructor(
    private readonly _id: string,
    private _name: string
  ) {
    this.validate();
  }

  static create(name: string): Pet {
    return new Pet(uuidv7(), name);
  }

  private validate(): void {
    if (!this._name || this._name.length < 2) {
      throw new DomainError('Pet name must be at least 2 characters');
    }
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }
}
```

### 2. Application Layer (`src/application/`)

**Orchestration of use cases - thin coordination layer**

- **Use Cases**: One class per business operation (e.g., `RegisterPetUseCase`, `ScheduleAppointmentUseCase`)
  - Single public method: `execute(input: DTO): Promise<output>`
  - Coordinate domain entities and repositories
  - Handle transactions and cross-cutting concerns
  - NO business rules (those belong in domain)
- **DTOs**: Input/Output data transfer objects
  - Use `class-validator` decorators for validation
  - Keep separate from domain entities

```typescript
// Example Use Case Pattern
export class RegisterPetUseCase {
  constructor(
    private petRepository: IPetRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(input: RegisterPetDTO): Promise<PetOutputDTO> {
    // 1. Validate owner exists
    const owner = await this.userRepository.findById(input.ownerId);
    if (!owner) throw new NotFoundError("Owner not found");

    // 2. Create domain entity (validation happens here)
    const pet = new Pet(
      uuidv4(),
      input.name,
      input.species,
      input.birthDate,
      input.ownerId
    );

    // 3. Persist and return
    const savedPet = await this.petRepository.save(pet);
    return PetMapper.toDTO(savedPet);
  }
}
```

### 3. Infrastructure Layer (`src/infrastructure/`)

**External integrations and technical implementations**

- **Database**: TypeORM implementations of repository interfaces
  - Use `@Entity()` decorators on TypeORM models (separate from domain entities)
  - Map between TypeORM entities and domain entities
- **External Services**: Third-party APIs, email, storage, etc.
- **Configuration**: Database connections, environment variables

```typescript
// Example Repository Implementation
@Entity("pets")
class PetEntity {
  @PrimaryColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  species: string;

  @Column("date")
  birthDate: Date;

  @ManyToOne(() => UserEntity)
  owner: UserEntity;
}

export class TypeORMPetRepository implements IPetRepository {
  constructor(private repository: Repository<PetEntity>) {}

  async save(pet: Pet): Promise<Pet> {
    const entity = this.toEntity(pet);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  // Mapper methods to convert between domain and ORM entities
  private toDomain(entity: PetEntity): Pet {
    /* ... */
  }
  private toEntity(pet: Pet): PetEntity {
    /* ... */
  }
}
```

### 4. Presentation Layer (`src/presentation/` or `src/api/`)

**HTTP interface with Express**

- **Controllers**: Route handlers that delegate to use cases
  - Validate request using middleware (class-validator + class-transformer)
  - Call use case with validated DTO
  - Return appropriate HTTP status codes
  - Handle errors with proper HTTP responses

```typescript
// Example Controller Pattern
router.post("/pets", validateBody(RegisterPetDTO), async (req, res, next) => {
  try {
    const useCase = container.resolve(RegisterPetUseCase);
    const result = await useCase.execute(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error); // Let error middleware handle it
  }
});
```

## Technology Stack

### Core

- **Runtime**: Node.js (LTS version)
- **Language**: TypeScript (strict mode enabled)
- **Framework**: Express.js
- **Database**: PostgreSQL (via Docker Compose)
- **ORM**: TypeORM
- **Linting**: ESLint with TypeScript support

### Validation & Types

- **Input Validation**: `class-validator` + `class-transformer`
  - Apply decorators to all DTOs
  - Create validation middleware for routes
- **Type Safety**: Enable strict TypeScript options
  ```json
  {
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "noImplicitReturns": true
  }
  ```

### Code Quality & Standards

- **ESLint Configuration**: Use `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser`
  - Enforce consistent code style across the project
  - Catch common bugs and anti-patterns
  - Required configuration in `.eslintrc.json`:
  ```json
  {
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
      "ecmaVersion": 2022,
      "sourceType": "module",
      "project": "./tsconfig.json"
    },
    "plugins": ["@typescript-eslint"],
    "extends": [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:@typescript-eslint/recommended-requiring-type-checking"
    ],
    "rules": {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { "argsIgnorePattern": "^_" }
      ],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          "selector": "interface",
          "format": ["PascalCase"],
          "prefix": ["I"]
        },
        {
          "selector": "class",
          "format": ["PascalCase"]
        }
      ],
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error"
    }
  }
  ```
- **Prettier Integration**: Combine with Prettier for formatting
  ```bash
  npm install --save-dev eslint-config-prettier eslint-plugin-prettier
  ```

### Testing (70%+ Coverage Required)

- **Framework**: Jest
- **Structure**: Mirror `src/` structure in `test/` or `__tests__/`
- **Test Pyramid**:
  - **Unit Tests**: Domain entities, value objects, use cases (with mocked repositories)
  - **Integration Tests**: Repository implementations, database interactions
  - **E2E Tests**: Full HTTP request/response cycle

```typescript
// Example Use Case Test Pattern
describe("RegisterPetUseCase", () => {
  let useCase: RegisterPetUseCase;
  let mockPetRepo: jest.Mocked<IPetRepository>;
  let mockUserRepo: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockPetRepo = { save: jest.fn(), findById: jest.fn() };
    mockUserRepo = { findById: jest.fn() };
    useCase = new RegisterPetUseCase(mockPetRepo, mockUserRepo);
  });

  it("should register a pet successfully", async () => {
    // Arrange
    const owner = new User("user-1", "John Doe", "john@example.com");
    mockUserRepo.findById.mockResolvedValue(owner);
    mockPetRepo.save.mockImplementation(async (pet) => pet);

    const input = new RegisterPetDTO();
    input.name = "Max";
    input.species = "dog";
    input.birthDate = new Date("2020-01-01");
    input.ownerId = "user-1";

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.name).toBe("Max");
    expect(mockPetRepo.save).toHaveBeenCalledTimes(1);
  });

  it("should throw NotFoundError when owner does not exist", async () => {
    // Arrange
    mockUserRepo.findById.mockResolvedValue(null);

    const input = new RegisterPetDTO();
    input.ownerId = "non-existent";

    // Act & Assert
    await expect(useCase.execute(input)).rejects.toThrow(NotFoundError);
  });

  it("should throw ValidationError when pet name is too short", async () => {
    const owner = new User("user-1", "John Doe", "john@example.com");
    mockUserRepo.findById.mockResolvedValue(owner);

    const input = new RegisterPetDTO();
    input.name = "X"; // Too short
    input.ownerId = "user-1";

    await expect(useCase.execute(input)).rejects.toThrow(DomainError);
  });
});

// Test all HTTP error scenarios in controller tests
describe("POST /pets", () => {
  it("should return 400 for invalid input", async () => {
    const response = await request(app)
      .post("/pets")
      .send({ name: "" }) // Invalid
      .expect(400);

    expect(response.body.error).toMatch(/validation/i);
  });

  it("should return 404 when owner not found", async () => {
    const response = await request(app)
      .post("/pets")
      .send({ name: "Max", species: "dog", ownerId: "non-existent" })
      .expect(404);
  });

  it("should return 500 for database errors", async () => {
    // Mock database failure
    // Test implementation
  });
});
```

## Docker & Database Setup

### Docker Compose Structure

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: petapp
      POSTGRES_USER: petapp_user
      POSTGRES_PASSWORD: petapp_pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://petapp_user:petapp_pass@postgres:5432/petapp
```

### TypeORM Configuration

- Use environment variables for connection
- Enable migrations for schema management
- Separate entities (infrastructure) from domain models

## Development Workflows

### Setup Commands

```bash
# Install dependencies
npm install

# Start PostgreSQL
docker-compose up -d postgres

# Run migrations
npm run migration:run

# Start development server
npm run dev
```

### Code Quality Commands

```bash
# Run ESLint on entire codebase
npm run lint

# Fix auto-fixable ESLint issues
npm run lint:fix

# Run Prettier formatting
npm run format

# Check formatting without fixing
npm run format:check
```

### Testing Commands

```bash
# Run all tests
npm test

# Run tests with coverage (must meet 70%+)
npm run test:coverage

# Run specific test file
npm test -- path/to/test

# Run tests in watch mode
npm run test:watch
```

### Database Commands

```bash
# Create new migration
npm run migration:create -- -n MigrationName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Drop schema (dev only)
npm run schema:drop
```

## Error Handling Standards

### Custom Error Hierarchy

```typescript
// Domain Errors
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends Error {
  constructor(public errors: string[]) {
    super("Validation failed");
    this.name = "ValidationError";
  }
}
```

### HTTP Error Mapping

- **400 Bad Request**: Validation errors, invalid input
- **401 Unauthorized**: Missing/invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Business rule violation (e.g., duplicate)
- **500 Internal Server Error**: Unexpected errors

### Error Middleware

```typescript
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof ValidationError) {
    return res
      .status(400)
      .json({ error: error.message, details: error.errors });
  }
  if (error instanceof NotFoundError) {
    return res.status(404).json({ error: error.message });
  }
  if (error instanceof DomainError) {
    return res.status(400).json({ error: error.message });
  }
  // Log unexpected errors
  console.error("Unexpected error:", error);
  res.status(500).json({ error: "Internal server error" });
});
```

## Code Organization Principles

### Dependency Rule

**Dependencies flow inward**: Presentation → Application → Domain

- Domain layer has NO dependencies on outer layers
- Application layer depends only on domain
- Infrastructure implements interfaces defined in domain/application

### Naming Conventions

- **Files**: `kebab-case.ts` (e.g., `register-pet.use-case.ts`)
- **Classes**: `PascalCase` (e.g., `RegisterPetUseCase`)
- **Interfaces**: Prefix with `I` (e.g., `IPetRepository`)
- **DTOs**: Suffix with `DTO` (e.g., `RegisterPetDTO`)
- **Test files**: Match source file with `.spec.ts` or `.test.ts` suffix

### Folder Structure Example

```
src/
├── domain/
│   ├── entities/
│   │   ├── pet.entity.ts
│   │   └── user.entity.ts
│   ├── value-objects/
│   │   ├── email.vo.ts
│   │   └── address.vo.ts
│   ├── repositories/
│   │   ├── pet.repository.interface.ts
│   │   └── user.repository.interface.ts
│   └── services/
│       └── appointment.service.ts
├── application/
│   ├── use-cases/
│   │   ├── register-pet.use-case.ts
│   │   └── schedule-appointment.use-case.ts
│   └── dtos/
│       ├── register-pet.dto.ts
│       └── pet-output.dto.ts
├── infrastructure/
│   ├── database/
│   │   ├── entities/
│   │   │   └── pet.entity.ts (TypeORM)
│   │   ├── repositories/
│   │   │   └── typeorm-pet.repository.ts
│   │   └── migrations/
│   └── external-services/
└── presentation/
    ├── controllers/
    │   └── pet.controller.ts
    ├── middlewares/
    │   ├── validation.middleware.ts
    │   └── error.middleware.ts
    └── routes/
        └── pet.routes.ts
```

## Scalability Considerations

### Database

- Use **connection pooling** in TypeORM configuration
- Create **indexes** on frequently queried columns
- Use **transactions** for multi-step operations in use cases
- Consider **read replicas** for heavy read workloads

### Application

- Implement **dependency injection** (e.g., tsyringe, InversifyJS)
- Use **async/await** consistently for I/O operations
- Implement **caching** layer for frequently accessed data (Redis)
- Design for **horizontal scaling** (stateless application servers)

### Code

- Keep use cases **small and focused** (single responsibility)
- Use **repository pattern** to abstract data access
- Implement **event-driven architecture** for cross-context communication
- Consider **CQRS** pattern for read-heavy operations

## Quick Reference

### When Adding a New Feature

1. **Define domain entity** in `src/domain/entities/` with validation
2. **Create repository interface** in `src/domain/repositories/`
3. **Implement use case** in `src/application/use-cases/`
4. **Create DTOs** with validation decorators
5. **Implement repository** in `src/infrastructure/database/repositories/`
6. **Add controller** and routes in `src/presentation/`
7. **Write tests** for all layers (aim for 70%+ coverage)
8. **Create migration** for database changes

### Common Pitfalls to Avoid

- ❌ Putting business logic in controllers or repositories
- ❌ Domain entities depending on infrastructure (TypeORM annotations)
- ❌ Use cases containing HTTP-specific code
- ❌ Skipping validation in domain entities
- ❌ Not testing error scenarios
- ❌ Exposing internal IDs in API responses without mapping
- ❌ Missing transaction boundaries for multi-step operations

### Best Practices

- ✅ Validate early: DTOs at API boundary, entities at construction
- ✅ Use TypeScript strict mode and leverage type system
- ✅ Test each layer independently with appropriate mocks
- ✅ Keep use cases thin - delegate to domain services
- ✅ Map between domain and persistence models explicitly
- ✅ Return DTOs from use cases, not domain entities
- ✅ Use meaningful HTTP status codes and error messages
- ✅ Run ESLint before committing (`npm run lint`)
- ✅ Run tests and coverage before committing

### ESLint Rules to Follow

- **No `any` type**: Always use specific types or generics
- **Explicit return types**: Add return types to all functions (warning level)
- **Interface naming**: Prefix all interfaces with `I` (e.g., `IPetRepository`)
- **Unused variables**: Remove or prefix with `_` if intentionally unused
- **Console statements**: Only use `console.warn()` and `console.error()`, use proper logging library for others
- **Const over let**: Use `const` by default, `let` only when reassignment needed
- **No var**: Never use `var`, always `const` or `let`

### Pre-commit Checklist

1. Run `npm run lint:fix` to auto-fix issues
2. Run `npm run format` to format code
3. Run `npm test` to verify all tests pass
4. Run `npm run test:coverage` to ensure 70%+ coverage
5. Review ESLint warnings and address them
6. Write commit message following Conventional Commits

### Commit Message Standards

**Follow [Conventional Commits](https://www.conventionalcommits.org/) specification**:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types**:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semi-colons, etc.)
- `refactor`: Code refactoring without changing functionality
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process, tooling, dependencies

**Examples**:

```bash
feat(pets): add pet registration endpoint
fix(auth): resolve token validation error
test(use-cases): add tests for RegisterPetUseCase
refactor(domain): extract validation logic to value objects
docs: update API documentation
chore(deps): upgrade TypeORM to v0.3.17
```

**Scope**: Use layer names (`domain`, `application`, `infrastructure`, `presentation`) or feature names (`pets`, `users`, `appointments`)

**Breaking Changes**: Add `!` after type/scope or `BREAKING CHANGE:` in footer

```bash
feat(api)!: change pet registration response format
```

---

**Target Coverage**: Maintain 70%+ test coverage across all layers (currently 93.72%)
**Code Quality**: Zero ESLint errors before committing
**Commit Messages**: Follow Conventional Commits specification
**CI/CD**: Linting and tests must pass before merging to main branch
**Security**: Never commit actual database credentials - use placeholders in documentation
