# E-Commerce REST API

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![PostgreSQL Version](https://img.shields.io/badge/postgresql-%3E%3D13.0-blue.svg)](https://postgresql.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

A robust, production-ready REST API for e-commerce platforms built with Node.js, Express, and PostgreSQL. This API provides comprehensive functionality for user management, product catalog operations, shopping cart workflows, order processing, and secure checkout transactions.

## 🏗️ Architecture Overview

This API follows a modular architecture pattern with clear separation of concerns:

- **Authentication Layer**: JWT-based authentication with Passport.js and bcrypt password hashing
- **Business Logic Layer**: Organized route handlers for different domains (products, carts, orders, checkout)
- **Data Access Layer**: PostgreSQL with raw SQL queries for optimal performance
- **API Documentation**: Swagger/OpenAPI integration for interactive API documentation
- **Session Management**: Express-session for user state management

### Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.19+
- **Database**: PostgreSQL 13+
- **Authentication**: JWT + Passport.js + bcrypt
- **Documentation**: Swagger UI
- **Session Management**: express-session
- **Development**: PostCSS + Tailwind CSS (for static assets)

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Examples](#examples)
- [Project Structure](#project-structure)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🔐 Authentication & User Management
- User registration with secure password hashing
- JWT-based authentication with access tokens
- Session management for persistent login state
- Secure logout functionality

### 📦 Product Management
- Full CRUD operations for product catalog
- Product search and filtering capabilities
- Stock management and inventory tracking
- Product metadata and descriptions

### 🛒 Shopping Cart
- Automatic cart creation for registered users
- Add, update, remove cart items
- Cart persistence across sessions
- Real-time cart total calculations

### 📋 Order Processing
- Order placement and status tracking
- Order history for users
- Order item details and pricing
- Order status management

### 💳 Checkout System
- Transactional checkout process
- Cart-to-order conversion
- Price validation and stock verification
- Atomic transaction handling

### 📚 API Documentation
- Interactive Swagger UI at `/api-docs`
- OpenAPI 3.0 specification
- Request/response examples
- Authentication guides

## 🛠️ Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js**: Version 18.0.0 or higher
- **PostgreSQL**: Version 13.0 or higher
- **npm**: Latest stable version (comes with Node.js)
- **Git**: For version control

### System Requirements

- **Operating System**: Linux, macOS, or Windows
- **Memory**: Minimum 512MB RAM
- **Storage**: Minimum 1GB free space
- **Network**: Open ports for HTTP/HTTPS traffic

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd e-commerce-rest-api
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies and generate the `package-lock.json` file.

### 3. Database Setup

#### Create PostgreSQL Database

```sql
-- Connect to PostgreSQL as superuser
CREATE DATABASE ecommerce;
CREATE USER ecommerce WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ecommerce TO ecommerce;
```

#### Run Database Migrations

```bash
# Connect to your PostgreSQL instance and run:
psql -U ecommerce -d ecommerce -f db/init_db.sql
```

### 4. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env
```

Edit the `.env` file with your specific configuration:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Security
SESSION_SECRET=your-super-secret-session-key-change-this-in-production
ACCESS_TOKEN_SECRET=your-super-secret-access-token-key-change-this-in-production

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=ecommerce
DB_PASSWORD=your_secure_password
DB_NAME=ecommerce
DB_SSL=false
```

### 5. Start the Application

```bash
# Development mode
npm start

# Or run directly with Node.js
node index.js
```

The API server will start on `http://localhost:3000`

### 6. Verify Installation

- Visit `http://localhost:3000/api-docs` to access Swagger UI
- The API documentation should load successfully
- All endpoints should be available for testing

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port number | No | `3000` |
| `NODE_ENV` | Environment mode | No | `development` |
| `SESSION_SECRET` | Session encryption key | Yes | - |
| `ACCESS_TOKEN_SECRET` | JWT token secret | Yes | - |
| `DB_HOST` | PostgreSQL host | No | `localhost` |
| `DB_PORT` | PostgreSQL port | No | `5432` |
| `DB_USER` | Database username | Yes | - |
| `DB_PASSWORD` | Database password | Yes | - |
| `DB_NAME` | Database name | Yes | - |
| `DB_SSL` | Enable SSL for DB | No | `false` |

### Security Best Practices

1. **Always change default secrets** in production
2. **Use strong passwords** for database credentials
3. **Enable SSL** in production environments
4. **Rotate secrets** regularly
5. **Use environment-specific configurations**

## 📖 Usage

### Authentication

Before accessing protected endpoints, users must authenticate and obtain a JWT token.

#### Register a New User

```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

#### Login

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securepassword123"
  }'
```

Use the returned JWT token in the `Authorization` header for subsequent requests:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3000/protected-endpoint
```

## 🔌 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register a new user |
| POST | `/login` | User login |
| POST | `/logout` | User logout |

### Product Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | Get all products |
| GET | `/products/:id` | Get product by ID |
| POST | `/products` | Create new product (Admin) |
| PUT | `/products/:id` | Update product (Admin) |
| DELETE | `/products/:id` | Delete product (Admin) |

### Cart Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cart` | Get user's cart |
| POST | `/cart/items` | Add item to cart |
| PUT | `/cart/items/:id` | Update cart item quantity |
| DELETE | `/cart/items/:id` | Remove item from cart |
| DELETE | `/cart` | Clear entire cart |

### Order Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | Get user's orders |
| GET | `/orders/:id` | Get order by ID |
| POST | `/checkout` | Checkout cart (creates order) |

### Checkout Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/checkout` | Process checkout and create order |

## 💡 Examples

### Complete E-commerce Workflow

#### 1. User Registration and Login

```bash
# Register user
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "customer1",
    "email": "customer@example.com",
    "password": "mypassword123"
  }'

# Login to get token
TOKEN=$(curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "customer1", "password": "mypassword123"}' \
  | jq -r '.token')
```

#### 2. Browse Products

```bash
# Get all products
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/products
```

#### 3. Manage Shopping Cart

```bash
# Add item to cart
curl -X POST http://localhost:3000/cart/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 2}'

# View cart
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/cart
```

#### 4. Checkout Process

```bash
# Process checkout
curl -X POST http://localhost:3000/checkout \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# View orders
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/orders
```

### JavaScript/Node.js Example

```javascript
const axios = require('axios');

// Configure API client
const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Login function
async function login(username, password) {
  try {
    const response = await apiClient.post('/login', {
      username,
      password
    });
    return response.data.token;
  } catch (error) {
    console.error('Login failed:', error.response.data);
  }
}

// Get products function
async function getProducts(token) {
  try {
    const response = await apiClient.get('/products', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch products:', error.response.data);
  }
}

// Usage example
async function main() {
  const token = await login('customer1', 'mypassword123');
  const products = await getProducts(token);
  console.log('Available products:', products);
}

main();
```

## 📁 Project Structure

```
e-commerce-rest-api/
├── db/                          # Database related files
│   └── init_db.sql             # Database schema and initialization
├── public/                      # Static assets
│   ├── index.html              # Static HTML page
│   ├── script.js               # Frontend JavaScript
│   └── style.css               # Stylesheet
├── routes/                      # API route handlers
│   ├── auth.js                 # Authentication routes
│   ├── products.js             # Product management routes
│   ├── cart.js                 # Shopping cart routes
│   ├── orders.js               # Order management routes
│   └── checkout.js             # Checkout processing routes
├── swagger/                     # API documentation
│   └── swagger.json            # OpenAPI specification
├── .env.example                 # Environment variables template
├── .gitignore                  # Git ignore patterns
├── db.js                       # Database connection and queries
├── index.js                    # Application entry point
├── package.json                # Project dependencies and scripts
├── passport-config.js          # Passport authentication configuration
├── postcss.config.js           # PostCSS configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── README.md                   # Project documentation
```

### Key Files Description

- **`index.js`**: Main application file with Express setup, middleware configuration, and route mounting
- **`db.js`**: Database connection pool and query helper functions
- **`passport-config.js`**: Passport.js authentication strategy configuration
- **`routes/`**: Modular route handlers organized by feature domains
- **`db/init_db.sql`**: Complete database schema with tables, indexes, and relationships

## 🔧 Development

### Development Setup

1. **Clone and install** as described in [Installation](#installation)
2. **Set up your IDE** with Node.js support
3. **Install PostgreSQL** and create development database
4. **Configure environment** variables for development
5. **Start development server**: `npm start`

### Code Organization

The codebase follows a modular structure:

- **Route handlers** are organized by feature (products, cart, orders, etc.)
- **Database queries** are centralized in `db.js`
- **Authentication logic** is contained in `passport-config.js`
- **Business logic** is separated from HTTP concerns

### Adding New Features

1. Create route handler in `routes/` directory
2. Add database queries to `db.js`
3. Update Swagger documentation
4. Add tests for new endpoints
5. Update this README with new features

## 🧪 Testing

### Running Tests

```bash
# Syntax check
npm test

# Or run directly
node --check index.js
```

### Manual Testing

Use the Swagger UI at `http://localhost:3000/api-docs` to test endpoints interactively.

### Testing Checklist

- [ ] User registration and login flow
- [ ] Product CRUD operations
- [ ] Cart management functionality
- [ ] Checkout process
- [ ] Order creation and retrieval
- [ ] Error handling for invalid requests

## 🚢 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong, unique secrets for `SESSION_SECRET` and `ACCESS_TOKEN_SECRET`
- [ ] Enable `DB_SSL=true` for secure database connections
- [ ] Configure production database credentials
- [ ] Set up reverse proxy (nginx recommended)
- [ ] Configure SSL/TLS certificates
- [ ] Set up monitoring and logging
- [ ] Configure firewall rules

### Environment Setup

```bash
# Production environment variables
PORT=3000
NODE_ENV=production
SESSION_SECRET=your-production-session-secret-here
ACCESS_TOKEN_SECRET=your-production-jwt-secret-here
DB_HOST=your-production-db-host
DB_PORT=5432
DB_USER=your-db-user
DB_PASSWORD=your-secure-db-password
DB_NAME=ecommerce_prod
DB_SSL=true
```

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔍 Troubleshooting

### Common Issues

#### Database Connection Errors

**Problem**: `ECONNREFUSED` or connection timeout errors

**Solutions**:
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check database credentials in `.env` file
- Ensure database exists and user has permissions
- Verify firewall settings allow connections

#### Authentication Failures

**Problem**: JWT token errors or login failures

**Solutions**:
- Check `ACCESS_TOKEN_SECRET` in environment variables
- Verify user credentials and password hashing
- Ensure JWT token is included in Authorization header
- Check token expiration settings

#### Port Already in Use

**Problem**: `EADDRINUSE` error on startup

**Solutions**:
- Change `PORT` in `.env` file
- Kill process using the port: `lsof -ti:3000 | xargs kill`
- Check if another instance is running

#### Module Not Found Errors

**Problem**: Missing dependencies or import errors

**Solutions**:
- Run `npm install` to install dependencies
- Check Node.js version compatibility
- Verify all required packages are listed in `package.json`
- Clear npm cache: `npm cache clean --force`

### Debug Mode

Enable debug logging by setting:

```bash
NODE_ENV=development
DEBUG=express:*
```

### Getting Help

1. Check the [API documentation](#api-documentation) at `/api-docs`
2. Review application logs for error details
3. Verify environment configuration
4. Test database connectivity separately

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Install** dependencies: `npm install`
5. **Make** your changes
6. **Test** your changes thoroughly
7. **Commit** your changes: `git commit -m 'Add amazing feature'`
8. **Push** to the branch: `git push origin feature/amazing-feature`
9. **Open** a Pull Request

### Development Workflow

#### Branch Naming Convention

- `feature/` - New features or enhancements
- `bugfix/` - Bug fixes
- `hotfix/` - Critical production fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring

#### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:
```
feat(auth): add OAuth2 authentication support

- Add OAuth2 provider configuration
- Update authentication middleware
- Add new login endpoints

Closes #123
```

### Code Standards

#### JavaScript Style
- Use ES6+ features
- Follow async/await patterns for asynchronous code
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

#### Database Queries
- Use parameterized queries to prevent SQL injection
- Follow consistent naming conventions
- Add proper indexing for performance
- Include error handling for database operations

#### API Design
- Follow RESTful conventions
- Use appropriate HTTP status codes
- Include proper error messages
- Validate input data

### Testing Requirements

- Add tests for new features
- Ensure existing tests pass
- Test error conditions and edge cases
- Update API documentation for new endpoints

### Documentation

- Update README for new features
- Add inline code comments
- Update Swagger documentation
- Include usage examples

### Submitting Changes

1. **Create** a pull request with a clear title and description
2. **Reference** any related issues
3. **Include** screenshots for UI changes
4. **Wait** for code review and feedback
5. **Address** any requested changes
6. **Merge** approved pull requests

### Community Guidelines

- Be respectful and inclusive
- Use welcoming and inclusive language
- Be collaborative and open-minded
- Focus on what is best for the community
- Show empathy towards other community members

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

**Happy coding! 🎉**

For questions, issues, or contributions, please visit our [GitHub repository](https://github.com/your-username/e-commerce-rest-api).
