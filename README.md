# E-Commerce_REST_API

This project is a comprehensive backend solution for an e-commerce platform, designed to facilitate seamless online shopping experiences. It features a RESTful API that supports various e-commerce operations, including user management, product listings, shopping carts, and order processing.

## Overview

The architecture employs Node.js and Express for the server-side logic, with PostgreSQL as the data persistence layer. It leverages Passport.js for authentication, bcrypt for password hashing, and JSON Web Tokens for session management. The project is organized into modular components, including database configurations, route definitions, and middleware, ensuring a clean and maintainable codebase.

## Features

- User registration and login
- Product creation, retrieval, update, and deletion
- Shopping cart management
- Order placement and history retrieval
- RESTful API endpoints documented with Swagger

## Getting started

### Requirements

- Node.js
- PostgreSQL
- Git

### Quickstart

1. Clone the repository.
2. Install dependencies with `npm install`.
3. Set up the PostgreSQL database and update the `.env` file with your database credentials.
4. Run the SQL scripts in `db/init_db.sql` to create the necessary tables.
5. Start the server with `npm start`.

### License

