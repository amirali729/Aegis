# Aegis

> Version: 1.0
>
> Status: Design Phase
>
> Document: 06 - Authentication Architecture

---

# Table of Contents

1. Introduction
2. Authentication Goals
3. Authentication Components
4. Authentication Flow
5. Signup Architecture
6. Login Architecture
7. JWT Architecture
8. Refresh Token Architecture
9. Session Architecture
10. Password Management
11. Logout
12. Logout All
13. Email Verification
14. Forgot Password
15. Reset Password
16. Security Rules
17. Future Authentication Features
18. Complete Authentication Sequence

---

# 1. Introduction

Authentication is responsible for answering one question:

> **Who is this user?**

It is not responsible for deciding what the user can do.

That responsibility belongs to Authorization.

Authentication includes:

- Signup
- Login
- Logout
- Logout All Devices
- JWT
- Refresh Tokens
- Password Hashing
- Sessions
- Email Verification
- Password Reset

---

# 2. Authentication Goals

The authentication system should provide:

✓ Secure password storage

✓ Stateless access tokens

✓ Refresh token rotation

✓ Multi-device support

✓ Session management

✓ Logout from one device

✓ Logout from every device

✓ Email verification

✓ Password recovery

✓ Strong typing

✓ Framework independence

---

# 3. Authentication Components

```
Client

↓

Router

↓

Middleware

↓

Controller

↓

Repository

↓

Storage

↓

Database
```

Authentication also depends on:

```
Token Service

↓

Password Service

↓

Cookie Configuration

↓

Email Service

↓

Session Service
```

---

# 4. Authentication Flow

```
Signup

↓

Login

↓

Receive Cookies

↓

Access Protected APIs

↓

Access Token Expires

↓

Refresh Token

↓

Continue

↓

Logout
```

---

# 5. Signup Architecture

```
POST /signup
```

Flow

```
Client

↓

Controller

↓

SignUpDto

↓

Repository

↓

Check Username

↓

Check Email

↓

Hash Password

↓

Create User

↓

Return SignUpResponse
```

Repository responsibilities

- Verify uniqueness
- Create user
- Store password hash
- Return response

Controller responsibilities

- Create DTO
- Call repository
- Return Result

---

# 6. Login Architecture

```
POST /login
```

Flow

```
Controller

↓

LoginDto

↓

Repository

↓

Find User

↓

Compare Password

↓

Generate Token Pair

↓

Store Refresh Token

↓

Return LoginResponse

↓

Controller

↓

Set Cookies
```

Cookies

```
accessToken

refreshToken
```

---

# 7. JWT Architecture

Access Token contains only information needed for authorization.

Example payload

```
{
    _id,
    role,
    tokenVersion,
    iat,
    exp
}
```

Avoid storing

- Password
- Email
- Username
- Address

JWT should remain small.

---

# 8. Refresh Token Architecture

Refresh Token exists only to generate a new access token.

Flow

```
Login

↓

Generate Refresh Token

↓

Save Database

↓

Cookie

↓

Refresh Endpoint

↓

Verify

↓

Generate New Pair

↓

Replace Old Refresh Token
```

This is called **Refresh Token Rotation**.

---

# 9. Session Architecture

Every login creates a session.

Example

```
Phone

↓

Session A
```

```
Laptop

↓

Session B
```

```
Tablet

↓

Session C
```

Each session owns

- Refresh Token
- Device
- Login Time
- Last Activity
- IP Address (future)
- User Agent (future)

Future implementation

```
sessions

id

userId

refreshTokenHash

device

lastUsed

createdAt
```

Instead of storing one refresh token on the user document.

---

# 10. Password Management

Passwords are never stored.

Only hashes.

```
Password

↓

bcrypt

↓

Hash

↓

Database
```

Verification

```
Entered Password

↓

bcrypt.compare()

↓

true / false
```

---

# 11. Change Password

Flow

```
verifyJwt

↓

Controller

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

Success
```

Future improvement

Changing password should revoke every active session.

```
password change

↓

tokenVersion++

↓

All tokens invalid
```

---

# 12. Logout

Logout removes only the current session.

Flow

```
Controller

↓

Repository

↓

Delete Refresh Token

↓

Clear Cookies

↓

Success
```

Current implementation

```
user.refreshToken = undefined
```

Future

Delete session row.

---

# 13. Logout All

Flow

```
Controller

↓

Repository

↓

tokenVersion++

↓

Delete Sessions

↓

Clear Cookies
```

Every access token immediately becomes invalid.

---

# 14. Email Verification

Future

Signup

↓

Generate Verification Token

↓

Store Hash

↓

Email Service

↓

User Clicks Link

↓

Verify Token

↓

User.isVerified = true

---

Verification token should expire.

Example

24 hours.

---

# 15. Forgot Password

Flow

```
User

↓

Forgot Password

↓

Generate Reset Token

↓

Hash Token

↓

Save

↓

Email

↓

Reset Link
```

Never store reset token in plain text.

Store only its hash.

---

# 16. Reset Password

```
Reset Link

↓

Verify Token

↓

Find User

↓

Hash New Password

↓

Save

↓

tokenVersion++

↓

Success
```

Incrementing tokenVersion forces every existing session to logout.

---

# 17. Cookie Strategy

Access Token

```
httpOnly

secure

sameSite

short expiry
```

Refresh Token

```
httpOnly

secure

sameSite

long expiry
```

JavaScript should never access these cookies.

---

# 18. Security Rules

Passwords

✓ Hashed

JWT

✓ Signed

Refresh Tokens

✓ Rotated

Cookies

✓ HTTP Only

Sessions

✓ Revocable

Password Reset

✓ Time Limited

Email Verification

✓ Time Limited

---

# 19. Token Version

Every JWT contains

```
tokenVersion
```

Every request compares

```
JWT Version

==

Database Version
```

Mismatch

↓

Unauthorized

This allows

- Logout All
- Password Reset
- Account Compromise Recovery

without tracking every access token.

---

# 20. Future Authentication Features

OAuth

```
Google

GitHub

Discord

Microsoft

Apple
```

Magic Links

Passwordless Login

WebAuthn

Passkeys

MFA

Backup Codes

Trusted Devices

Device Approval

---

# 21. Authentication Sequence

```
Client

↓

POST /login

↓

Controller

↓

Repository

↓

Database

↓

Password Verify

↓

Generate Access Token

↓

Generate Refresh Token

↓

Save Refresh Token

↓

Return LoginResponse

↓

Controller

↓

Set Cookies

↓

BaseResponse

↓

Client
```

---

Refresh Flow

```
Client

↓

Cookie

↓

Controller

↓

Repository

↓

Verify Refresh Token

↓

Check Database

↓

Check tokenVersion

↓

Generate New Pair

↓

Update Database

↓

Set New Cookies

↓

Response
```

---

Logout Flow

```
Client

↓

verifyJwt

↓

Controller

↓

Repository

↓

Delete Session

↓

Clear Cookies

↓

Response
```

---

# Authentication Module Responsibilities

The Authentication module owns:

✓ Signup

✓ Login

✓ Logout

✓ Logout All

✓ JWT

✓ Refresh Tokens

✓ Password Hashing

✓ Password Change

✓ Password Reset

✓ Email Verification

✓ Session Creation

It does **not** own:

✗ Roles

✗ Permissions

✗ Organizations

✗ API Keys

✗ OAuth Clients

These belong to separate modules.

---

# Summary

The Authentication module is responsible for securely proving user identity and managing login sessions.

It uses:

- JWT Access Tokens
- Refresh Token Rotation
- HTTP Only Cookies
- Session Management
- Password Hashing
- Token Versioning

Future enhancements such as OAuth, Passkeys, MFA, and Passwordless Login can be added without changing the core authentication architecture because they all eventually produce the same authenticated identity.
