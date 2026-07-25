# Identity Platform

> Version: 1.0
>
> Status: Design Phase
>
> Document: 05 - Database Architecture

---

# Table of Contents

1. Introduction
2. Goals
3. Supported Databases
4. Design Philosophy
5. Layered Database Architecture
6. Repository vs Data Provider
7. Storage Providers
8. Entity Mapping
9. Database Selection
10. Self Hosted
11. SaaS
12. Migrations
13. Future Improvements

---

# 1. Introduction

The Identity Platform must support multiple databases while keeping the business logic identical.

Supported databases include

- MongoDB
- PostgreSQL
- MySQL

Every feature should work regardless of which database is selected.

---

# 2. Goals

The database architecture should satisfy these requirements.

✓ Multiple database engines

✓ One business logic implementation

✓ Easy provider replacement

✓ Strong typing

✓ Easy testing

✓ No duplicated authentication logic

---

# 3. Supported Databases

Initially

```
MongoDB
```

Future

```
PostgreSQL

MySQL
```

Only one database is active at runtime.

---

# 4. Design Philosophy

Business logic should never know which database is being used.

For example

```
AuthRepository
```

should not contain

```ts
mongoose.findOne(...)
```

or

```ts
SELECT * FROM users
```

Instead it communicates with an abstraction.

---

# 5. Layered Architecture

```
Controller

↓

Auth Repository

↓

User Storage Interface

↓

Mongo Provider

or

PostgreSQL Provider

or

MySQL Provider

↓

Database
```

Notice that the repository doesn't know which provider is active.

---

# 6. Why Separate Them?

Many developers accidentally duplicate business logic.

Wrong approach

```
MongoAuthRepository

PostgresAuthRepository

MysqlAuthRepository
```

Now Login exists three times.

Signup exists three times.

Logout exists three times.

Refresh exists three times.

Password Change exists three times.

Every bug must be fixed three times.

Avoid this.

---

Correct approach

```
AuthRepository

↓

UserStorage Interface

↓

Mongo Provider

↓

Postgres Provider

↓

Mysql Provider
```

Authentication logic exists only once.

Only database operations change.

---

# 7. Storage Layer

Example

```
AuthRepository

↓

userStorage.findByEmail()

↓

MongoUserStorage

↓

MongoDB
```

or

```
AuthRepository

↓

userStorage.findByEmail()

↓

PostgresUserStorage

↓

PostgreSQL
```

Same business logic.

Different storage implementation.

---

# 8. User Storage Interface

```
UserStorage

findById()

findByEmail()

findByUsername()

create()

save()

update()

delete()
```

Every provider implements these methods.

---

# 9. MongoDB Provider

```
MongoUserStorage
```

Uses

```
Mongoose

Schemas

Documents
```

Only this provider knows Mongoose.

---

# 10. PostgreSQL Provider

```
PostgresUserStorage
```

Uses

```
SQL

Relations

Transactions
```

Only this provider knows SQL.

---

# 11. MySQL Provider

```
MysqlUserStorage
```

Uses

```
MySQL Driver

Queries

Transactions
```

Again,

Business logic never changes.

---

# 12. Example

Repository

```
login()

↓

find user

↓

verify password

↓

generate tokens

↓

save refresh token

↓

return LoginResponse
```

The only different part

```
find user
```

Mongo

```
User.findOne(...)
```

Postgres

```
SELECT ...
```

MySQL

```
SELECT ...
```

Everything else is identical.

---

# 13. Folder Structure

```
database/

provider/

user-storage.interface.ts

role-storage.interface.ts

session-storage.interface.ts

mongodb/

mongo-user-storage.ts

mongo-role-storage.ts

mongo-session-storage.ts

postgres/

postgres-user-storage.ts

postgres-role-storage.ts

postgres-session-storage.ts

mysql/

mysql-user-storage.ts

mysql-role-storage.ts

mysql-session-storage.ts
```

---

# 14. Provider Factory

Only one provider is selected.

```
DATABASE_PROVIDER

↓

mongodb

↓

MongoUserStorage
```

or

```
postgres

↓

PostgresUserStorage
```

or

```
mysql

↓

MysqlUserStorage
```

---

# 15. Environment Configuration

```
DATABASE_PROVIDER=mongodb
```

or

```
DATABASE_PROVIDER=postgres
```

or

```
DATABASE_PROVIDER=mysql
```

---

# 16. Dependency Injection

Application startup

```
MongoUserStorage

↓

AuthRepository

↓

AuthController
```

Changing providers only changes one line during startup.

---

# 17. Entity Mapping

Each provider converts its database representation into a common domain object.

Mongo

```
Mongoose Document

↓

Domain User
```

Postgres

```
SQL Row

↓

Domain User
```

MySQL

```
SQL Row

↓

Domain User
```

Everything above the storage layer only works with the domain object.

---

# 18. Migrations

Mongo

No migrations required.

PostgreSQL

Use migration files.

MySQL

Use migration files.

Every provider manages its own schema.

---

# 19. SaaS Deployment

Our hosted platform will use

```
MongoDB
```

only.

Customers never see this.

They only consume APIs.

---

# 20. Self Hosted

Users may choose

```
MongoDB

PostgreSQL

MySQL
```

by changing

```
DATABASE_PROVIDER
```

and starting Docker Compose.

No source code modifications are required.

---

# 21. Future Database Providers

The architecture allows adding

```
SQLite

CockroachDB

MariaDB

Azure SQL

Amazon Aurora
```

without changing authentication logic.

Only a new storage provider is implemented.

---

# Final Architecture

```
                   Controller

                        │

                        ▼

                AuthRepository

                        │

                        ▼

             IUserStorage Interface

         ┌──────────────┼──────────────┐

         ▼              ▼              ▼

MongoUserStorage  PostgresUserStorage  MysqlUserStorage

         │              │              │

         ▼              ▼              ▼

     MongoDB       PostgreSQL       MySQL
```

---

# Key Design Rules

✓ Business logic exists only once.

✓ Database logic exists inside providers.

✓ Controllers never access databases.

✓ Repositories never know the database engine.

✓ Storage providers never contain business rules.

✓ Adding a new database should require creating only a new provider.

---

# Summary

The Identity Platform separates **business logic** from **data access**.

Authentication, authorization, sessions, and future modules all interact with storage interfaces rather than database-specific APIs.

This architecture enables:

- One codebase
- Multiple databases
- Minimal code duplication
- Easier testing
- Easier maintenance
- Clean support for both Hosted SaaS and Self-Hosted deployments