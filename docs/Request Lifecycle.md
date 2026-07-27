# Aegis

> Version: 1.1
>
> Status: Reflects the current implementation (Request pipeline, middleware chain, controllers, services, repositories, sessions, API keys, validation, and error handling)
>
> Document: 07 - Request Lifecycle

---

# Table of Contents

1. Request Lifecycle Overview
2. Design Goals
3. High-Level Request Flow
4. HTTP Request Pipeline
5. Middleware Pipeline
6. Controller Layer
7. Service Layer
8. Repository Layer
9. Response Generation
10. Error Handling
11. Authentication & Authorization Flow
12. API Key Request Flow
13. Current Status
14. Future Improvements

---

# 1. Request Lifecycle Overview

Every HTTP request follows the same predictable path through the application.

The request moves through multiple layers, where each layer has a single responsibility.

```
Client

↓

Express Router

↓

Middleware

↓

Controller

↓

Service

↓

Repository

↓

Database

↓

Response
```

Every layer only communicates with the layer directly below it.

No layer skips another.

---

# 2. Design Goals

The request lifecycle was designed around several principles.

---

## Predictability

Every request should follow the exact same pipeline.

Developers should always know where business logic belongs.

---

## Separation of Responsibilities

Each layer performs only one job.

```
Middleware

↓

Validation

----------------

Controller

↓

Request orchestration

----------------

Service

↓

Business rules

----------------

Repository

↓

Database access
```

---

## Testability

Every layer can be tested independently.

Repositories can be mocked.

Services can be unit tested.

Controllers can be tested without a database.

---

## Reusability

Business logic should never depend on Express.

This allows future integrations through:

- REST API
- CLI
- Background Jobs
- Queue Workers
- GraphQL
- gRPC

---

# 3. High-Level Request Flow

```
Client

↓

Express Server

↓

Router

↓

Middleware

↓

Controller

↓

Service

↓

Repository

↓

MongoDB

↓

Result

↓

Controller

↓

BaseResponse

↓

HTTP Response
```

Each step has a clearly defined responsibility.

---

# 4. HTTP Request Pipeline

Example:

```
POST /api/v1/auth/login
```

Pipeline:

```
Incoming Request

↓

Express Router

↓

Rate Limiter

↓

Request Validation

↓

handle()

↓

Controller

↓

Service

↓

Repository

↓

Database

↓

Result

↓

BaseResponse

↓

Client
```

The pipeline remains consistent across all modules.

---

# Route Registration

Routes are responsible only for wiring components together.

Example responsibilities:

- Register endpoints
- Apply middleware
- Instantiate repository
- Instantiate service
- Instantiate controller

Routes never contain business logic.

---

# 5. Middleware Pipeline

Middleware executes before controllers.

Typical pipeline:

```
Incoming Request

↓

Helmet

↓

CORS

↓

Cookie Parser

↓

JSON Parser

↓

Rate Limiter

↓

Authentication

↓

Authorization

↓

Validation

↓

Controller
```

Every middleware performs a single task.

---

## Request Validation

All request bodies, query parameters, and route parameters are validated using Zod.

```
Request

↓

validate()

↓

Valid

↓

Controller
```

Invalid requests never reach business logic.

Validated values are attached to the request (or `res.locals`) instead of mutating Express's read-only properties.

---

## Authentication

Protected endpoints execute:

```
verifyJwt
```

Responsibilities:

- Read access token
- Verify signature
- Verify expiration
- Load authenticated user
- Attach user to request

Unauthenticated requests receive:

```
401 Unauthorized
```

---

## Authorization

Endpoints requiring permissions execute:

```
requirePermission()

↓

Permission Evaluator

↓

Allow

or

Deny
```

Denied requests return:

```
403 Forbidden
```

---

## API Key Authentication

Server-to-server endpoints may authenticate using:

```
X-API-Key
```

Pipeline:

```
API Key

↓

Hash Incoming Key

↓

Compare Stored Hash

↓

Authenticated Application
```

---

# 6. Controller Layer

Controllers receive validated requests.

Responsibilities:

- Read DTOs
- Read authenticated user
- Call service
- Set cookies (when required)
- Return Result

Controllers never:

- Query MongoDB
- Hash passwords
- Evaluate permissions
- Create business rules

---

## Example Flow

```
Controller

↓

Login DTO

↓

Auth Service

↓

Result<LoginResponse>

↓

Set Cookies

↓

Return Response
```

Controllers remain intentionally thin.

---

# 7. Service Layer

Services contain every business rule.

Typical responsibilities include:

- Password verification
- Duplicate detection
- Session creation
- JWT generation
- Refresh token rotation
- Email verification
- Password recovery
- Audit logging
- Permission orchestration

Services never know about Express.

---

## Example

```
Login Request

↓

Verify User

↓

Compare Password

↓

Create Session

↓

Generate Tokens

↓

Record Audit Event

↓

Return Result
```

---

# 8. Repository Layer

Repositories isolate database access.

Responsibilities include:

- Create documents
- Read documents
- Update documents
- Delete documents
- Execute queries

Repositories never:

- Generate JWTs
- Verify passwords
- Send emails
- Apply business rules

---

## Repository Flow

```
Service

↓

Repository Interface

↓

Repository Implementation

↓

Mongoose Model

↓

MongoDB
```

All database operations are isolated behind repository interfaces.

---

# 9. Response Generation

Controllers return:

```
Result<T, E>
```

The shared `handle()` helper converts the result into HTTP responses.

```
Controller

↓

Result

↓

handle()

↓

BaseResponse

↓

HTTP Response
```

Successful responses use:

```
BaseResponse<T>
```

Errors use:

```
BaseErrorResponse
```

This provides a consistent API across every module.

---

# Cookies

Authentication endpoints additionally set:

- Access Token Cookie
- Refresh Token Cookie

Controllers are responsible for writing cookies to the response.

---

# 10. Error Handling

Errors follow a centralized pipeline.

```
Repository

↓

Infrastructure Error

↓

Service

↓

Domain Error

↓

Controller

↓

Result

↓

handle()

↓

HTTP Status

↓

BaseErrorResponse
```

Unexpected errors are handled by the global error handler.

Stack traces are hidden in production.

---

## Validation Errors

```
400 Bad Request
```

Returned before controllers execute.

---

## Authentication Errors

```
401 Unauthorized
```

Examples:

- Invalid JWT
- Missing JWT
- Expired Session

---

## Authorization Errors

```
403 Forbidden
```

Returned when the authenticated user lacks the required permission.

---

## Infrastructure Errors

Database failures are translated into safe error responses rather than exposing database details.

---

# 11. Authentication & Authorization Flow

Protected request example:

```
Client

↓

Access Token Cookie

↓

verifyJwt

↓

Authenticated User

↓

requirePermission()

↓

Controller

↓

Service

↓

Repository

↓

MongoDB

↓

Response
```

Authentication always occurs before authorization.

---

# Session Refresh Flow

```
Expired Access Token

↓

Refresh Endpoint

↓

Session Lookup

↓

Verify Refresh Token

↓

Rotate Refresh Token

↓

Issue New Access Token

↓

Set Cookies

↓

Response
```

Only one valid refresh token exists per session at any given time.

---

# 12. API Key Request Flow

Applications authenticate differently from users.

```
Client

↓

X-API-Key

↓

API Key Middleware

↓

Hash Key

↓

Lookup API Key

↓

Verify Status

↓

Attach Application

↓

Controller

↓

Response
```

This flow is intended for server-to-server communication.

---

# 13. Current Status

## Implemented

✅ Express Request Pipeline

✅ Middleware Chain

✅ Zod Validation

✅ JWT Authentication

✅ Permission Middleware

✅ API Key Middleware

✅ Controllers

✅ Services

✅ Repository Pattern

✅ MongoDB Integration

✅ Centralized Response Handling

✅ Global Error Handler

✅ Session Management

✅ Refresh Token Rotation

---

## Partially Implemented

- Tenant resolution middleware exists but tenant isolation is not yet fully enforced.
- Audit logging is implemented but does not yet cover every security-sensitive action.

---

## Not Implemented

- Background Job Pipeline
- Queue Processing
- Distributed Event Bus
- GraphQL Request Pipeline
- gRPC Request Pipeline
- Request Tracing (OpenTelemetry)

---

# 14. Future Improvements

## Distributed Request Tracing

Future requests may include trace IDs.

```
Client

↓

Trace ID

↓

Application

↓

Database

↓

Logs

↓

Monitoring
```

---

## Background Jobs

Long-running work may move into queues.

Examples:

- Email Sending
- Audit Export
- Webhooks
- Notifications

---

## Redis Integration

Redis will support:

- Rate Limiting
- Session Caching
- Permission Caching

---

## Observability

Future production deployments may integrate:

- OpenTelemetry
- Prometheus
- Grafana
- Loki / ELK

---

# Request Lifecycle Summary

Every request in Aegis follows a consistent pipeline from Express routing through middleware, controllers, services, repositories, and MongoDB before returning a standardized response.

Each layer has a single responsibility, making the system predictable, testable, and easy to extend. Authentication, authorization, validation, session management, and centralized error handling are all integrated into this lifecycle, providing a solid foundation for future scalability.
