# Aegis

> Version: 1.1
>
> Status: Reflects the actual current structure (see Project Overview for implementation status)
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
Auth_System/

├── src/
├── docs/
├── Docker/
├── sdk/
├── tests/                (empty scaffold - no tests currently ship in this snapshot)
├── package.json
├── tsconfig.json
├── tsconfig.test.json
├── eslint.config.js
├── prettier.config.mjs
├── commitlint.config.js
└── README.md
```

Note: the real `.env` lives at `src/shared/config/.env` (that's the path `server.ts` loads via `dotenv.config()`), not at the project root.

Note: `src/config/`, `src/database/`, and `src/infrastructure/` exist as empty top-level scaffolds. Configuration actually lives in `src/shared/config/`, and the active database connection lives in `src/shared/database/dbconnection.ts` - these top-level folders are reserved for future use (e.g. a real multi-database provider abstraction) but are currently unused.

---

# 3. Source Directory

```
src/

├── app.ts
├── server.ts

├── shared/

├── modules/

├── bootstrap/

├── config/           (empty scaffold - see note above)
├── database/         (empty scaffold - see note above)
└── infrastructure/    (empty scaffold - see note above)
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

## bootstrap/

One-off scripts, run via `tsx`, not part of the running server:

```
bootstrap/

rbac-defaults.ts   - default permission/role catalog

seed-rbac.ts       - upserts the default catalog (npm run seed:rbac)

assign-admin.ts    - grants the Admin role to a user by email (npm run seed:admin -- <email>)
```

---

# 4. Shared Layer

Everything reusable belongs here.

```
shared/

├── api-endpoint/

├── config/

├── constants/

├── database/

├── email/

├── errors/

├── http/

├── openapi/

├── response/

├── result/

├── security/

├── types/

├── utils/

└── validation/
```

---

## api-endpoint/

One file per module, exporting its route-path constants (e.g. `auth.api.endpoint.ts`, `role.api.endpoint.ts`, `application.api.endpoin.ts`\*, `api-key.api.endpoint.ts`, `tenant.api.endpoint.ts`, `permission.api.endpoint.ts`, `session.api.endpoint.ts`, `audit.api.endpoint.ts`).

\* yes, that filename has a typo in the current codebase (`endpoin.ts`, missing the final `t`) - harmless (self-consistent), just cosmetic.

---

## config/

```
config/

.env            - the real environment file (see note in section 2)

cookie.ts       - COOKIE_OPTIONS (httpOnly, secure, sameSite - currently hardcoded, not read from env)
```

---

## constants/

```
http-status.mapper.ts   - currently unused/dead (the active status codes live in shared/http/http-status.ts)
```

---

## database/

```
dbconnection.ts   - the single active Mongoose connection
```

---

## email/

Currently empty - kept as a placeholder; the real mailer lives in `modules/email/` (see Section 5).

---

## errors/

```
error.shape.ts

conflict.error.ts

domain.error.ts

forbidden.error.ts

infrastructure.error.ts

not-found.error.ts

unauthorized.error.ts

validation.error.ts
```

---

## http/

```
handle.ts             - wraps a controller method's Result<T,E> into an HTTP response; takes the module's own error mapper as a parameter, so it isn't coupled to any one module's error union

http-status.ts         - the actual status-code constants in use

validate.ts            - Zod-based request validation middleware factory

error-handler.ts        - global errorHandler + notFoundHandler, registered last in app.ts

health.router.ts        - GET /health

response.factory.ts     - convenience builders on top of BaseResponse/BaseErrorResponse
```

---

## openapi/

```
openapi/

component.ts        - shared OpenAPI schemas (entities, request bodies, security schemes)

openapi-spec.ts      - assembles info/servers/tags/components + every module's paths

swagger.routes.ts     - mounts Swagger UI at /api/docs and raw JSON at /api/docs/openapi.json

docs/                - one *.docs.ts file per module, each exporting that module's path definitions
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
Result<T, E>

ok()

err()
```

---

## security/

```
security/

authorization/
    permission-evaluator.ts   - unions permissions across a user's roles

context/                       - empty scaffold

hashing/
    token-hash.ts              - SHA-256 hashing for verification/reset tokens, refresh tokens, API keys

jwt/                            - empty scaffold (JWT signing/verification currently lives on the User model itself and in verifyJwt.middleware.ts)

middleware/
    verifyJwt.middleware.ts
    requirePermission.middleware.ts
    resolveTenant.middleware.ts
    apiKeyAuth.middleware.ts
    rate-limit.middleware.ts
```

---

## types/

```
express.d.ts       - augments Request with `user`, `tenantId`, `application`

jwtPayload.d.ts
```

---

## utils/

```
logger.ts       - the actual Logger class in use (console-based; no winston/pino)

duration.ts      - parses "15m"/"7d"-style strings into milliseconds

async-handler.ts - currently unused/dead code (handle.ts supersedes it)
```

---

## validation/

```
object-id.schema.ts   - the only file actually used across modules; the module-specific request-body schemas live inside each module's own `validation/` folder, not here
```

---

# 5. Modules

Every business capability gets its own module.

```
modules/

auth/

session/

role/

permission/

tenant/

application/

apikey/       - split out from application/ into its own module

email/

audit/

oauth/        - empty scaffold, not implemented

webhook/      - empty scaffold, not implemented
```

Every implemented module follows the same internal structure.

---

# 6. Module Structure

Example (auth)

```
auth/

controller/
    auth.controller.impl.ts
    interface/
        auth.controller.interface.ts

service/
    auth.service.impl.ts
    user-mapper.ts
    interface/
        auth.service.interface.ts

repository/
    auth.repository.impl.ts
    interface/
        auth.repository.interface.ts

model/
    user.model.ts

dto/

responses/

errors/

routes/
    auth.routes.ts

types/
    auth.types.ts

validation/
    auth.schemas.ts   (Zod schemas)

http/
    map-auth-error.ts

index.ts   (barrel export)
```

Note the folder is `model/` (singular), not `models/`.

---

## controller/

Contains only controllers. Thin - parses the request into a DTO, calls the service, returns the `Result`. No business logic and no direct database access.

```
auth.controller.impl.ts

interface/auth.controller.interface.ts
```

---

## service/

Owns all business logic: duplicate checks, password verification, token orchestration, translating dependency failures into domain errors. This is where business rules live - **not** in the repository.

```
auth.service.impl.ts

interface/auth.service.interface.ts
```

---

## repository/

Pure data access. No business rules. Every method returns `Result<T, InfrastructureError>` - the only error a repository can produce is "the database could not be reached."

```
auth.repository.impl.ts

interface/auth.repository.interface.ts
```

---

## dto/

```
signup.dto.ts

login.dto.ts

change-password.dto.ts

forgot-password.dto.ts

reset-password.dto.ts

verify-email.dto.ts

resend-verification.dto.ts
```

---

## responses/

```
signup.response.ts

login.response.ts

logout.response.ts

change-password.response.ts

forgot-password.response.ts

reset-password.response.ts

verify-email.response.ts

resend-verification.response.ts

RefreshTokenResponse.ts

user.response.ts
```

---

## errors/

```
email-already-exists.error.ts

username-already-exists.error.ts

invalid-password.error.ts

user-not-found.error.ts

invalid-token.error.ts

refresh-token-expired.error.ts

invalid-verification-token.error.ts

email-already-verified.error.ts

invalid-reset-token.error.ts

reset-token-expired.error.ts
```

---

## routes/

```
auth.routes.ts
```

The composition root: wires the concrete repository/service/controller together, applies validation/rate-limit/auth middleware, and registers routes. Only place in the module that instantiates concrete classes.

---

## model/

```
user.model.ts
```

Contains only the Mongoose schema. A future PostgreSQL/MySQL implementation would not use this file.

---

## validation/

```
auth.schemas.ts
```

Zod schemas used by `shared/http/validate.ts` middleware.

---

## types/

Module-specific result/error union types.

```
auth.types.ts
```

---

# 7. Infrastructure

`src/infrastructure/` exists as an empty top-level scaffold today - reserved for future external integrations (cache, object storage, queues, monitoring) once they're actually built.

The one external integration that _is_ implemented today - email delivery - lives inside `modules/email/`, not a top-level `infrastructure/` folder:

```
modules/email/

mailer.interface.ts     - IMailer contract

console.mailer.ts        - dev fallback, logs instead of sending

nodemailer.mailer.ts     - real SMTP delivery

mailer.factory.ts        - picks Console vs Nodemailer based on SMTP_HOST

templates/
    auth-emails.ts        - verification + password-reset email content
```

Future, once built, would live under `infrastructure/`:

```
infrastructure/

cache/       - Redis

storage/     - S3 / MinIO

queue/       - background jobs

monitoring/  - metrics, health
```

---

# 8. Database

`src/database/` exists as an empty top-level scaffold today. There is currently no cross-database provider abstraction (no `DATABASE_PROVIDER` env var, no `postgres`/`mysql` implementations) - every module's repository talks to its own Mongoose model directly (e.g. `modules/auth/model/user.model.ts`, `modules/role/model/role.model.ts`).

Repositories are still written against an interface (`IAuthRepository`, `IRoleRepository`, etc.), so a future non-Mongo implementation would only need to implement that interface - the multi-database story is architecturally possible, just not built yet.

Planned future structure (not implemented):

```
database/

provider/     - interfaces

mongodb/      - current implementation, today lives per-module instead

postgres/     - future

mysql/        - future
```

Selection would happen through configuration, e.g. `DATABASE_PROVIDER=mongodb`.

---

# 9. SDK

```
sdk/

core/     - @identity-platform/core, implemented. Framework-agnostic TypeScript client:
              automatic auth, automatic silent token refresh (retries the original
              request once after a 401), and a typed module per backend module
              (auth, sessions, permissions, roles, tenants, applications, apiKeys, audit).

react/    - empty scaffold, not implemented
```

Future SDKs (not started): `next/`, `node/`, `nest/`, `vue/`, `angular/`.

These SDKs consume the public REST API only. They never access the database directly.

---

# 10. Docker

```
Docker/

development/    - implemented: docker-compose.yml, Dockerfile, .env.example, README.md,
                    plus mongo/run.sh + mongo/stop.sh for running just a standalone Mongo container

production/      - empty scaffold, not implemented

kubernetes/       - empty scaffold, not implemented
```

Note the folder is `Docker/` (capital D).

---

## development/

```
docker-compose.yml   - backend + MongoDB (with auth), healthchecks

Dockerfile            - multi-stage build (compile TS, then run only prod deps + dist)

.env.example          - copy to .env before running docker compose

README.md

mongo/
    run.sh   - run a standalone Mongo container without the full compose
    stop.sh
```

---

## production/ and kubernetes/

Not implemented yet. See the Roadmap document for what's needed before a production deployment (env validation, a real production compose profile without exposed DB ports or hardcoded credentials, graceful shutdown, etc.).

---

# 11. Documentation

```
docs/

Project Overview.md

System Architecture.md

Folder Structure.md

Request Lifecycle.md

Database Architecture.md

Authentication Architecture.md

Authorization Architecture.md

Multi-Tenant & SaaS Architecture.md

SDK Architecture & Client Integration.md

Security Architecture & Best Practices.md

Infrastructure, Deployment & DevOps Architecture.md

Roadmap, Milestones & Implementation Plan.md
```

API reference documentation is also generated live from the running server at `/api/docs` (Swagger UI) and `/api/docs/openapi.json` (raw OpenAPI spec) - see `src/shared/openapi/`.

---

# 12. Testing

`tests/` exists as an empty top-level scaffold in this snapshot - no tests currently ship in this copy of the project.

When tests were written for the auth module, the convention used was:

```
src/test/unit-test/<module-name>/

<module>.repository.test.ts

<module>.service.test.ts

<module>.controller.test.ts

<module>.routes.test.ts
```

using Vitest, with Mongoose models mocked directly (no real database dependency for unit tests) and Supertest for route-level tests. `tsconfig.test.json` type-checks `src/test/` separately so test files never leak into the production `dist/` build (the main `tsconfig.json` excludes `src/test`).

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
