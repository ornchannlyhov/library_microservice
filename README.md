# MicroLib - Microservices Library Management System

A modern, containerized Library Management System built with Node.js microservices and a vanilla JS frontend.

## 🚀 Key Features

- **Microservices Architecture**: Independent services for Users, Books, Loans, and Reviews.
- **Modern UI**: Clean, responsive frontend with a consistent Card Layout and Lucide icons.
- **Full CRUD**: Complete management of library resources.
- **Review System**: 5-star rating and review system for books with statistical aggregation.
- **Containerized**: Fully Dockerized with Docker Compose for easy orchestration.

## 🏗️ Architecture

The system consists of 5 services:

1.  **Frontend** (`:8080`): Nginx serving static HTML/CSS/JS.
2.  **User Service** (`:3001`): Manages user accounts.
3.  **Book Service** (`:3002`): Manages book inventory.
4.  **Loan Service** (`:3003`): Handles book borrowing and returning logic.
5.  **Review Service** (`:3004`): Manages book ratings and comments.

**Database**: MongoDB (Single instance with separate logical databases: `user_db`, `book_db`, `loan_db`, `review_db`).

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, Mongoose
- **Database**: MongoDB
- **Frontend**: HTML5, CSS3 (Variables & Flexbox/Grid), Vanilla JavaScript
- **Icons**: Lucide Icons
- **DevOps**: Docker, Docker Compose, GitHub Actions (CI/CD)

## 📦 Getting Started

### Prerequisites

- Docker & Docker Compose

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/ornchannlyhov/library_microservice.git
    cd library_microservice
    ```

2.  **Run with Docker Compose**
    ```bash
    docker-compose up --build
    ```

3.  **Access the Application**
    Open [http://localhost:8080](http://localhost:8080) in your browser.

## 🔌 API Endpoints

### User Service (`:3001`)
- `GET /users` - List all users
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Book Service (`:3002`)
- `GET /books` - List all books
- `POST /books` - Create book
- `PUT /books/:id` - Update book
- `DELETE /books/:id` - Delete book

### Loan Service (`:3003`)
- `GET /loans` - List active loans
- `POST /loans` - Create loan (Borrow book)
- `DELETE /loans/:id` - Return book

### Review Service (`:3004`)
- `GET /reviews` - List all reviews
- `POST /reviews` - Add review
- `GET /reviews/stats/:bookId` - Get average rating for a book

## 🧪 Testing

Each service has its own test suite using Jest.

```bash
# Example: Run tests for user service
cd user-service
npm install
npm test
```

## 📝 License

MIT License
