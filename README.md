# MicroLib - Microservices Library System

A microservices-based library management system built with Node.js, Express, MongoDB, and Docker.

## Architecture

The system consists of three independent services:

| Service | Port | Description |
|---------|------|-------------|
| **User Service** | 3001 | Manages library members |
| **Book Service** | 3002 | Manages book inventory |
| **Loan Service** | 3003 | Handles borrowing transactions |

```
┌─────────────────┐     ┌─────────────────┐
│  User Service   │     │  Book Service   │
│     :3001       │     │     :3002       │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
              ┌──────▼──────┐
              │ Loan Service │
              │    :3003     │
              └──────────────┘
```

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB
- **Containerization**: Docker & Docker Compose
- **Testing**: Jest & Supertest
- **CI/CD**: GitHub Actions

## Quick Start

### Run with Docker Compose

```bash
docker-compose up --build
```

### Test the APIs

```bash
# Create a user
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'

# Create a book
curl -X POST http://localhost:3002/books \
  -H "Content-Type: application/json" \
  -d '{"title":"Clean Code","author":"Robert Martin"}'

# Create a loan (use IDs from above)
curl -X POST http://localhost:3003/loans \
  -H "Content-Type: application/json" \
  -d '{"userId":"<user_id>","bookId":"<book_id>"}'
```

## Running Tests

```bash
# User Service
cd user-service && npm install && npm test

# Book Service
cd book-service && npm install && npm test

# Loan Service
cd loan-service && npm install && npm test
```

## CI/CD

The GitHub Actions pipeline automatically:
1. Runs tests on push/PR to `main`
2. Builds Docker images
3. Pushes to Docker Hub (requires `DOCKER_USERNAME` and `DOCKER_PASSWORD` secrets)

## Project Structure

```
.
├── user-service/
│   ├── index.js
│   ├── Dockerfile
│   ├── package.json
│   └── tests/
├── book-service/
│   ├── index.js
│   ├── Dockerfile
│   ├── package.json
│   └── tests/
├── loan-service/
│   ├── index.js
│   ├── Dockerfile
│   ├── package.json
│   └── tests/
├── docker-compose.yml
└── .github/workflows/ci-cd.yml
```

## License

MIT
