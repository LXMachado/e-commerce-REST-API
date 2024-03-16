// Import express
const express = require('express');
// Import dotenv to load environment variables
require('dotenv').config();
// Import dependencies for authentication
const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const initializePassport = require('./passport-config');
const db = require('./db');
// Import product routes
const productRoutes = require('./routes/products');
// Import cart routes
const cartRoutes = require('./routes/cart');
// Import order routes
const orderRoutes = require('./routes/orders');
// Import checkout routes
const checkoutRoutes = require('./routes/checkout');
// Initialize express app
const app = express();
// Import session for session handling
const session = require('express-session');
// Import swagger-ui-express and the Swagger document
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger/swagger.json');

// Serve static files
app.use(express.static('public'));

// Middleware to parse JSON bodies
app.use(express.json());
// Initialize passport
app.use(passport.initialize());
// Configure passport
initializePassport(passport);

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET, // INPUT_REQUIRED {Add a strong random value as SESSION_SECRET.}
  resave: false,
  saveUninitialized: false,
  cookie: { secure: !process.env.DEV_ENV } // INPUT_REQUIRED {Set DEV_ENV in your .env file depending on your environment.}
}));

// Simple GET route to '/ping' that returns a 200 status code with a message 'pong'
app.get('/ping', (req, res) => {
    console.log("Received request on '/ping' endpoint");
    res.status(200).send('pong');
});

// User registration route
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        // Check if user already exists
        const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length) {
            console.log(`Registration attempt failed: User already exists with email ${email}`);
            return res.status(400).send('User already exists with this email.');
        }
        // Insert new user
        await db.query('INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)', [username, email, hashedPassword]);
        console.log(`User ${username} registered successfully.`);
        res.status(201).send('User registered successfully.');
    } catch (error) {
        console.error('Error registering new user:', error.stack);
        res.status(500).send('Error registering user.');
    }
});

// User login route
app.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
    try {
        const user = { id: req.user.id, username: req.user.username };
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
        console.log(`User ${req.user.username} logged in successfully.`);
        res.json({ accessToken: accessToken });
    } catch (error) {
        console.error('Error logging in user:', error.stack);
        res.status(500).send('Error logging in.');
    }
});

// Use product routes
app.use('/products', productRoutes);

// Use cart routes
app.use('/cart', cartRoutes);

// Use order routes
app.use('/orders', orderRoutes);

// Use checkout routes
app.use('/checkout', checkoutRoutes);

// Serve Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Define the port to listen on
const PORT = process.env.PORT || 3000; // Specify the server port in your .env file or it will default to 3000

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}).on('error', (error) => {
    console.error(`Failed to start server on port ${PORT}:`, error.stack);
});