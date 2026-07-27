# Development Environment

## Setup

Copy the example env file (only needed once):

```bash
cd Docker/development
cp .env.example .env
```

## Start

```bash
cd Docker/development
docker compose up --build
```

---

## Stop

```bash
cd Docker/development
docker compose down
```

---

## Remove Volumes

```bash
cd Docker/development
docker compose down -v
```

---

## Backend

http://localhost:5000

---

## MongoDB

localhost:27017
