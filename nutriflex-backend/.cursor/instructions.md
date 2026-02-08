# Global Code Generation Rules for This Project (NestJS)

## 1. Architecture Pattern
Always generate modules using this exact structure:
- `module`
- `controller`
- `service`
- `repo`
- `entity`
- `dto`

Follow this strict architecture:

**Controller → Service → Repo → Database**

- Controller ONLY receives requests and forwards to service.
- Service contains light business logic only.
- Repo contains ALL database logic.
- Responses must always follow the unified format:
  {
    status: number,
    messageEn: string,
    messageAr: string,
    data: any,
    meta?: any
  }

## 2. DTO Rules
For every module, always generate:
- CreateDto
- UpdateDto
- PaginationDto
- SearchDto (if search exists)

DTO Rules:
- Use `class-validator`
- Use `@ApiProperty` for every field
- Keep CreateDto strict (required fields only)
- Make UpdateDto fields optional

## 3. Controller Rules
Controller must contain:
- Swagger decorators for every endpoint
- CRUD:
  POST / → create
  GET / → find all (with pagination + filters)
  GET /search → search endpoint
  GET /:id → findById
  PUT /:id → update
  PUT /:id/toggle-status → toggle status
  DELETE /:id → soft delete or hard delete

Always import PaginationDto + SearchDto into controller.

## 4. Service Rules
Service must:
- ONLY call repo functions
- Never write queries directly
- Only contain orchestration logic
- Example:
  return this.repo.updateEntity(id, dto);

## 5. Repository Rules
Repo must:
- Extend `Repository<Entity>`
- Use QueryBuilder, never raw SQL
- Contain:
  - createEntity()
  - findAll()
  - findById()
  - search()
  - updateEntity()
  - deleteEntity()
  - toggleStatus()

Repo must ALWAYS return consistent structured responses:
{
  status: HttpStatus.OK,
  messageEn: '',
  messageAr: '',
  data: ...,
  meta: ...
}

## 6. Entity Rules
- Follow TypeORM naming
- Include relations
- Use ActionTracked for created_date, updated_date

## 7. Code Style Rules
- Use camelCase for variables
- Use PascalCase for classes
- Never leave unused imports
- Always include Swagger documentation

## 8. Pagination
All list endpoints must support:
- skip
- take
- status
- area_id (if applicable)

## 9. Search Endpoints
Always generate:
GET /search
With optional filters:
- search: string
- status
- area_id
- email/phone if applicable

## 10. Status Toggle Endpoints
Always generate:
PUT /:id/toggle-status
