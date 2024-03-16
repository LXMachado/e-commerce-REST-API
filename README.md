# E-Commerce_REST_API

This project is an e-commerce backend solution that implements a REST API for handling various e-commerce functionalities, including user management, product management, shopping carts, and orders. It is built using Node.js and Express for the server-side logic, PostgreSQL for data storage, and employs Passport.js for authentication.

## Overview

The architecture of this project is designed to support scalable e-commerce applications. It uses Node.js and Express for creating RESTful endpoints, PostgreSQL for storing data, and integrates Passport.js for handling user authentication. The project structure is modular, with separate files for database configurations, route definitions, authentication strategies, and middleware.

## Features

- User registration and authentication
- Product management (CRUD operations)
- Shopping cart functionality
- Order processing
- REST API documentation with Swagger

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

Copyright (c) 2024.