# MicroLib - Microservices Library System

A microservices-based library management system built with Node.js, Express, MongoDB, and Docker.

## 🚀 Quick Start

```bash
docker-compose up --build
```

Then open **http://localhost:8080** in your browser.

## Architecture

```
┌──────────────────────────────────────────────┐
│              Frontend (8080)                 │
└─────────┬─────────────┬──────────────┬───────┘
          │             │              │
    ┌─────▼─────┐ ┌─────▼─────┐ ┌──────▼──────┐
    │   Users   │ │   Books   │ │    Loans    │
    │   :3001   │ │   :3002   │ │    :3003    │
    └─────┬─────┘ └─────┬─────┘ └──────┬──────┘
          │             │              │
          └─────────────┼──────────────┘
                        │
                  ┌─────▼─────┐
                  │  MongoDB  │
                  │   :27017  │
                  └───────────┘
```

## API Endpoints

### User Service (:3001)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List all users |
| GET | `/users/:id` | Get user by ID |
| POST | `/users` | Create user |
| PUT | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |

### Book Service (:3002)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/books` | List all books |
| GET | `/books/:id` | Get book by ID |
| POST | `/books` | Create book |
| PUT | `/books/:id` | Update book |
| DELETE | `/books/:id` | Delete book |

### Loan Service (:3003)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/loans` | List all loans |
| GET | `/loans/:id` | Get loan by ID |
| POST | `/loans` | Create loan |
| DELETE | `/loans/:id` | Return book |

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Frontend**: Vanilla HTML/CSS/JS
- **Containerization**: Docker & Docker Compose
- **Testing**: Jest & Supertest
- **CI/CD**: GitHub Actions

## Running Tests

```bash
cd user-service && npm test
cd book-service && npm test
cd loan-service && npm test
```

## License

MIT
