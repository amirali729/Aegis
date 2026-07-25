# Identity Platform

> Version: 1.0
>
> Status: Design Phase
>
> Document: 03 - Project Folder Structure

---

# Table of Contents

1. Folder Structure Philosophy
2. Root Directory
3. Source Directory
4. Shared Layer
5. Modules
6. Infrastructure
7. Database Providers
8. SDK
9. Docker
10. Documentation
11. Testing
12. Complete Project Structure

---

# 1. Folder Structure Philosophy

The project follows four simple principles.

- Feature-first organization
- Shared code lives in one place
- Every module is independent
- Infrastructure is isolated

Every feature should be easy to locate.

Example

```
Authentication

↓

modules/auth
```

instead of

```
controllers/

models/

services/

routes/
```

spread across the project.

---

# 2. Root Directory

```
identity-platform/

├── src/
├── docs/
├── docker/
├── sdk/
├── scripts/
├── tests/
├── .github/
├── package.json
├── tsconfig.json
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── README.md
└── LICENSE
```

---

# 3. Source Directory

```
src/

├── app.ts
├── server.ts

├── shared/

├── modules/

├── infrastructure/

├── database/

├── config/

└── bootstrap/
```

---

## app.ts

Responsible for

- Express app
- Middleware registration
- Routes
- Error handlers

No business logic.

---

## server.ts

Responsible for

- Loading environment variables
- Starting server
- Connecting database
- Graceful shutdown

---

# 4. Shared Layer

Everything reusable belongs here.

```
shared/

├── config/

├── constants/

├── errors/

├── http/

├── logger/

├── response/

├── result/

├── security/

├── types/

├── utils/

└── validation/
```

---

## config/

Application configuration.

```
config/

cookie.ts

cors.ts

jwt.ts

env.ts

database.ts

mail.ts
```

---

## constants/

```
HTTP Status

Role Names

Permission Names

Error Codes

Cookie Names

Environment Keys
```

---

## errors/

```
Base Errors

ValidationError

UnauthorizedError

ConflictError

NotFoundError

InfrastructureError
```

---

## http/

```
handle.ts

http-status.ts

map-auth-error.ts

request-context.ts
```

---

## logger/

Future

```
logger.ts

winston.ts

pino.ts
```

---

## response/

```
BaseResponse

BaseErrorResponse
```

---

## result/

```
Result

ok()

err()
```

---

## security/

```
middleware/

jwt/

password/

csrf/

```

---

## types/

Global types

```
express.d.ts

jwt-payload.ts

pagination.ts
```

---

## utils/

Reusable helpers.

```
date.ts

string.ts

crypto.ts

random.ts

pagination.ts
```

---

## validation/

Future validation schemas.

```
zod/

class-validator/
```

---

# 5. Modules

Every business capability gets its own module.

```
modules/

auth/

tenant/

application/

role/

permission/

session/

email/

oauth/

apikey/

audit/

webhook/
```

Every module follows the same internal structure.

---

# 6. Module Structure

Example

```
auth/

controller/

repository/

dto/

responses/

errors/

mapper/

interfaces/

routes/

service/

models/

types/

validators/
```

---

## controller/

Contains only controllers.

```
auth.controller.interface.ts

auth.controller.impl.ts
```

---

## repository/

Contains repository implementation.

```
auth.repository.impl.ts

interface/

auth.repository.interface.ts
```

---

## dto/

```
signup.dto.ts

login.dto.ts

change-password.dto.ts

refresh-token.dto.ts
```

---

## responses/

```
signup.response.ts

login.response.ts

logout.response.ts

refresh-token.response.ts
```

---

## errors/

```
email-already-exists.error.ts

invalid-password.error.ts

user-not-found.error.ts
```

---

## mapper/

```
user.mapper.ts
```

Responsible for converting

```
Mongo User

↓

UserResponse
```

---

## routes/

```
auth.routes.ts
```

Only route registration.

---

## service/

Only reusable services.

Current example

```
token.service.ts
```

Avoid putting business logic here.

---

## models/

```
user.model.ts
```

Contains only Mongoose schemas.

Later PostgreSQL implementation will not use these.

---

## validators/

Future

```
signup.validator.ts

login.validator.ts
```

---

## types/

Module-specific types.

```
auth.types.ts
```

---

# 7. Infrastructure

Infrastructure contains external integrations.

```
infrastructure/

mail/

cache/

storage/

queue/

monitoring/
```

---

## mail/

```
smtp.provider.ts

resend.provider.ts

sendgrid.provider.ts
```

---

## cache/

Future

```
redis.ts
```

---

## storage/

Future object storage.

```
s3.ts

minio.ts
```

---

## queue/

Future background jobs.

```
bullmq.ts
```

---

## monitoring/

```
metrics.ts

health.ts
```

---

# 8. Database

The storage layer is isolated.

```
database/

provider/

mongodb/

postgres/

mysql/
```

---

## provider/

Contains interfaces.

```
user.repository.ts

role.repository.ts

permission.repository.ts
```

Business logic depends on these interfaces.

---

## mongodb/

Mongo implementation.

```
user.repository.ts

role.repository.ts

session.repository.ts
```

---

## postgres/

Future PostgreSQL implementation.

---

## mysql/

Future MySQL implementation.

---

# 9. SDK

Future SDKs.

```
sdk/

typescript/

javascript/

python/

go/
```

These SDKs consume the public REST API.

They never access the database.

---

# 10. Docker

```
docker/

development/

production/

kubernetes/
```

---

## development/

```
docker-compose.dev.yml

mongodb/

redis/
```

---

## production/

```
docker-compose.prod.yml
```

---

## kubernetes/

Future deployment.

```
deployment.yaml

service.yaml

ingress.yaml
```

---

# 11. Documentation

```
docs/

01-project-overview.md

02-system-architecture.md

03-folder-structure.md

04-request-lifecycle.md

05-database-architecture.md

06-authentication.md

07-authorization.md

08-deployment.md

09-sdk.md

10-roadmap.md
```

---

# 12. Testing

```
tests/

unit/

integration/

e2e/

fixtures/

helpers/
```

---

## unit/

Repository tests.

Controller tests.

Utility tests.

---

## integration/

Database tests.

---

## e2e/

Full API testing.

```
POST /signup

↓

POST /login

↓

POST /refresh

↓

POST /logout
```

---

# 13. Complete Project Structure

```
identity-platform/

├── src/
│
│   ├── app.ts
│   ├── server.ts
│   │
│   ├── bootstrap/
│   │
│   ├── config/
│   │
│   ├── shared/
│   │
│   ├── infrastructure/
│   │
│   ├── database/
│   │
│   └── modules/
│       │
│       ├── auth/
│       ├── tenant/
│       ├── application/
│       ├── role/
│       ├── permission/
│       ├── session/
│       ├── email/
│       ├── oauth/
│       ├── apikey/
│       ├── audit/
│       └── webhook/
│
├── docs/
│
├── docker/
│
├── sdk/
│
├── tests/
│
├── scripts/
│
├── .github/
│
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── README.md
└── LICENSE
```

---

# Folder Design Rules

Every future feature should follow these rules.

✅ Feature belongs in its own module.

✅ Shared utilities belong in `shared/`.

✅ External systems belong in `infrastructure/`.

✅ Database implementations belong in `database/`.

✅ Business logic belongs in repositories.

✅ Controllers orchestrate only.

✅ Routes only register endpoints.

---

# Summary

The project is organized around business capabilities rather than technical layers.

This provides:

- Better scalability
- Easier navigation
- Independent modules
- Cleaner testing
- Simpler maintenance
- Easier onboarding for contributors

As the Identity Platform grows, new features should be added by creating new modules instead of expanding existing ones whenever possible.
