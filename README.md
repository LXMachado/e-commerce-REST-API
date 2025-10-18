# E-Commerce REST API

This project is a backend service for an e-commerce platform. It exposes a RESTful API that supports user management, product ca
talog operations, shopping cart workflows, order placement, and a transactional checkout process backed by PostgreSQL.

## Features

- User registration, login, logout, and session-backed authentication
- Product creation, retrieval, update, and deletion endpoints
- Shopping cart management with automatic cart creation during user registration
- Order placement, status updates, and history retrieval
- Checkout endpoint that converts a cart into a completed order inside a database transaction
- API documentation served through Swagger UI at `/api-docs`

## Getting Started

### Requirements

- Node.js 18+
- PostgreSQL 13+
- npm

### Installation

1. Clone the repository.
2. Install dependencies with `npm install` (this will recreate `package-lock.json`).
3. Create a PostgreSQL database and user, then run the SQL migrations in `db/init_db.sql`.
4. Copy `.env.example` to `.env` and fill in the required values.
5. Start the server with `npm start`.
6. Access the Swagger documentation at `http://localhost:3000/api-docs`.

### Environment Variables

Create a `.env` file using the template below.

```bash
PORT=3000
NODE_ENV=development
SESSION_SECRET=super-secret-session-key
ACCESS_TOKEN_SECRET=super-secret-access-token-key
DB_HOST=localhost
DB_PORT=5432
DB_USER=ecommerce
DB_PASSWORD=changeme
DB_NAME=ecommerce
DB_SSL=false
```

## Testing

Run a quick syntax check on the main entry point:

```bash
npm test
```

## Project Structure

- `index.js` – Express application bootstrap, authentication routes, and middleware configuration
- `routes/` – Feature-specific route handlers for products, carts, orders, and checkout
- `db/` – Database helper and SQL schema definitions
- `swagger/` – Swagger/OpenAPI documentation served via Swagger UI
- `public/` – Static assets served by Express

## License

ISC
