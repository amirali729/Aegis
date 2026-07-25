# Identity Platform

> Version: 1.0
>
> Status: Design Phase
>
> Document: 04 - Request Lifecycle

---

# Table of Contents

1. Introduction
2. General Request Lifecycle
3. Authentication Request Flow
4. Signup Flow
5. Login Flow
6. Refresh Token Flow
7. Change Password Flow
8. Logout Flow
9. Logout All Flow
10. Future Flows
11. Error Flow
12. Why This Architecture

---

# 1. Introduction

Every request follows the exact same lifecycle.

No endpoint should bypass this flow.

Whether the endpoint is:

- Signup
- Login
- Roles
- Permissions
- Sessions
- API Keys

all requests move through the same layers.

This consistency makes the project predictable and maintainable.

---

# 2. General Request Lifecycle

```
                Client

                  │

                  ▼

           Express Router

                  │

                  ▼

             Middleware

                  │

                  ▼

              handle()

                  │

                  ▼

             Controller

                  │

                  ▼

           Repository Layer

                  │

                  ▼

             Database

                  │

                  ▼

           Repository Layer

                  │

                  ▼

             Controller

                  │

                  ▼

              handle()

                  │

                  ▼

          BaseResponse JSON

                  │

                  ▼

               Client
```

Notice that the controller never sends responses directly.

It simply returns a Result.

The `handle()` utility converts that Result into an HTTP response.

---

# 3. Detailed Authentication Flow

Authentication uses this path.

```
Client

↓

POST /login

↓

Express Router

↓

handle()

↓

AuthController.login()

↓

LoginDto

↓

AuthRepository.login()

↓

User Model

↓

MongoDB

↓

Token Service

↓

Repository returns Result

↓

Controller

↓

Cookies Added

↓

Result returned

↓

handle()

↓

BaseResponse

↓

Client
```

---

# 4. Signup Flow

## Step 1

Client sends

```
POST /signup
```

Example

```json
{
  "username": "amir",
  "email": "amir@example.com",
  "password": "12345678"
}
```

---

## Step 2

Router

```
POST /signup

↓

AuthController.signUp()
```

Router contains no business logic.

---

## Step 3

Controller

Controller creates

```
SignUpDto
```

Example

```
new SignUpDto(
    username,
    email,
    password
)
```

The controller never validates uniqueness.

The controller never queries MongoDB.

---

## Step 4

Repository

Repository performs

```
Find existing user

↓

Check username

↓

Check email

↓

Hash password

↓

Create user

↓

Return response object
```

---

## Step 5

Repository returns

```
ok()

or

err()
```

Never Express Response.

Never JSON.

Never status code.

---

## Step 6

Controller returns Result.

```
return repository.signUp(dto)
```

---

## Step 7

handle()

```
if ok()

↓

BaseResponse

↓

201 Created
```

or

```
err()

↓

mapAuthError()

↓

BaseErrorResponse

↓

409
```

---

# Complete Signup Diagram

```
Client

↓

Route

↓

Controller

↓

DTO

↓

Repository

↓

MongoDB

↓

Repository

↓

Result

↓

Controller

↓

handle()

↓

HTTP Response
```

---

# 5. Login Flow

Request

```
POST /login
```

---

Controller

Creates

```
LoginDto
```

↓

Repository

Find user

↓

Verify password

↓

Generate Tokens

↓

Save Refresh Token

↓

Return LoginResponse

↓

Controller

Sets

```
accessToken cookie

refreshToken cookie
```

↓

handle()

↓

Client

---

Sequence Diagram

```
Client

↓

POST /login

↓

Controller

↓

Repository

↓

User.findOne()

↓

Password Compare

↓

Generate Tokens

↓

Save Refresh Token

↓

LoginResponse

↓

Cookie

↓

BaseResponse

↓

Client
```

---

# 6. Refresh Token Flow

Client

```
POST /refresh
```

Cookie

```
refreshToken
```

↓

Controller

Creates

```
RefreshTokenDto
```

↓

Repository

Verify JWT

↓

Find User

↓

Compare Refresh Token

↓

Compare Token Version

↓

Generate New Token Pair

↓

Update Refresh Token

↓

Return RefreshTokenResponse

↓

Controller

Update Cookies

↓

handle()

↓

Client

---

Sequence

```
Cookie

↓

JWT Verify

↓

Database

↓

Generate Tokens

↓

Save Tokens

↓

Response
```

---

# 7. Change Password Flow

Client

```
POST /change-password
```

↓

verifyJwt

↓

Controller

↓

ChangePasswordDto

↓

Repository

↓

Find User

↓

Compare Old Password

↓

Hash New Password

↓

Save User

↓

ChangePasswordResponse

↓

handle()

↓

Client

---

Diagram

```
JWT

↓

Controller

↓

Repository

↓

Password Compare

↓

Save Password

↓

Response
```

---

# 8. Logout Flow

Client

```
POST /logout
```

↓

verifyJwt

↓

Controller

↓

Repository

↓

Remove Refresh Token

↓

LogoutResponse

↓

Controller

↓

Clear Cookies

↓

handle()

↓

Client

---

Diagram

```
JWT

↓

Controller

↓

Repository

↓

refreshToken = undefined

↓

Save

↓

Clear Cookies

↓

Success
```

---

# 9. Logout All Flow

Client

```
POST /logout-all
```

↓

verifyJwt

↓

Controller

↓

Repository

↓

Increment

```
tokenVersion
```

↓

Clear refreshToken

↓

Save User

↓

Controller

↓

Clear Cookies

↓

Response

---

Why increment tokenVersion?

Suppose

```
Access Token A

Refresh Token A

Access Token B

Refresh Token B
```

exist on four devices.

Incrementing

```
tokenVersion
```

invalidates every token immediately.

Every future JWT validation checks

```
decoded.tokenVersion

==

user.tokenVersion
```

If different

↓

Unauthorized

---

# 10. Future Request Flows

The same lifecycle will be used for every future feature.

---

Forgot Password

```
Controller

↓

Repository

↓

Generate Reset Token

↓

Save

↓

Email Service

↓

Response
```

---

Email Verification

```
Controller

↓

Repository

↓

Generate Token

↓

Database

↓

Email Service

↓

Response
```

---

OAuth Login

```
Google

↓

Callback

↓

Controller

↓

Repository

↓

Find User

↓

Create User

↓

Generate Tokens

↓

Response
```

---

Create Role

```
Controller

↓

Repository

↓

Role Collection

↓

Response
```

---

Create Permission

```
Controller

↓

Repository

↓

Permission Collection

↓

Response
```

---

# 11. Error Lifecycle

Errors always follow one path.

```
Repository

↓

err()

↓

Controller

↓

handle()

↓

mapAuthError()

↓

BaseErrorResponse

↓

Client
```

Repository never sends JSON.

Repository never sets status codes.

Repository only returns domain errors.

---

Example

Repository

```
return err(
    new UserNotFoundError()
)
```

↓

handle()

↓

mapAuthError()

↓

```
404
```

↓

JSON

```json
{
  "success": false,
  "message": "User not found.",
  "statusCode": 404
}
```

---

# 12. Why This Architecture

This request lifecycle provides several advantages.

## Separation of Responsibilities

Routes

Only define endpoints.

Controllers

Coordinate requests.

Repositories

Contain business logic.

Models

Represent data.

Database

Stores data.

---

## Consistency

Every endpoint follows the same structure.

A developer implementing a new feature already knows where every piece of code belongs.

---

## Easy Testing

Each layer can be tested independently.

- Controller tests
- Repository tests
- Database tests
- End-to-end tests

---

## Database Independence

Business logic never depends directly on MongoDB.

Later implementations for PostgreSQL or MySQL can replace the storage layer without changing controllers.

---

## Scalability

As the project grows, new modules (Roles, Permissions, Sessions, Applications, OAuth, Webhooks) can reuse this exact request lifecycle.

No architectural changes are required.

---

# Summary

Every request in the Identity Platform follows this lifecycle:

```
HTTP Request

↓

Router

↓

Middleware

↓

handle()

↓

Controller

↓

DTO

↓

Repository

↓

Database

↓

Repository

↓

Result

↓

Controller

↓

handle()

↓

BaseResponse

↓

HTTP Response
```

This single, consistent flow is the foundation for the entire platform and should never be bypassed.
