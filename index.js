const express = require('express');
require('dotenv').config();
const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const initializePassport = require('./passport-config');
const db = require('./db');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const checkoutRoutes = require('./routes/checkout');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger/swagger.json');

const app = express();

initializePassport(passport);

const isProduction = process.env.NODE_ENV === 'production';
const sessionSecret = process.env.SESSION_SECRET || 'change-me-in-production';
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || 'replace-this-access-token-secret';
const sessionCookieDomain = process.env.SESSION_COOKIE_DOMAIN || 'localhost';
const sessionDurationMs = Number(process.env.SESSION_DURATION_MS || 1000 * 60 * 60 * 8);

if (!process.env.SESSION_SECRET) {
  console.warn('SESSION_SECRET is not set. Falling back to a weak development secret. Update your .env file before deploying.');
}

if (!process.env.ACCESS_TOKEN_SECRET) {
  console.warn('ACCESS_TOKEN_SECRET is not set. Falling back to a weak development secret. Update your .env file before deploying.');
}

app.use(express.static('public'));
app.use(express.json());

app.use(
  session({
    name: 'ecsid',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      sameSite: isProduction ? 'none' : 'lax',
      httpOnly: true,
      domain: sessionCookieDomain,
      path: '/',
      expires: new Date(Date.now() + sessionDurationMs),
      maxAge: sessionDurationMs,
    },
  }),
);

const csrfProtection = (req, res, next) => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    if (!req.session.csrfToken) {
      req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    }
    return next();
  }

  const requestToken = req.get('x-csrf-token') || req.body?._csrf;
  if (requestToken && requestToken === req.session.csrfToken) {
    return next();
  }

  return res.status(403).json({ message: 'Invalid CSRF token.' });
};

app.use(csrfProtection);

app.use(passport.initialize());
app.use(passport.session());

app.get('/csrf-token', (req, res) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }

  res.status(200).json({ csrfToken: req.session.csrfToken });
});

app.get('/ping', (_req, res) => {
  res.status(200).send('pong');
});

app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required.' });
    }

    const existingUser = await db.query('SELECT id FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (existingUser.rows.length) {
      return res.status(409).json({ message: 'An account with the supplied username or email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserResult = await db.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword],
    );
    const newUser = newUserResult.rows[0];

    await db.query('INSERT INTO carts (user_id) VALUES ($1)', [newUser.id]);

    res.status(201).json({ id: newUser.id, username: newUser.username, email: newUser.email });
  } catch (error) {
    console.error('Error registering new user:', error.stack);
    res.status(500).json({ message: 'Error registering user.' });
  }
});

app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Error logging in user:', err.stack);
      return next(err);
    }

    if (!user) {
      return res.status(401).json({ message: info?.message || 'Invalid credentials.' });
    }

    req.login(user, (loginError) => {
      if (loginError) {
        console.error('Error establishing session for user:', loginError.stack);
        return next(loginError);
      }

      const sessionUser = { id: user.id, username: user.username };
      req.session.user = sessionUser;
      const accessToken = jwt.sign(sessionUser, accessTokenSecret, { expiresIn: '1h' });

      return res.json({ accessToken, user: sessionUser });
    });
  })(req, res, next);
});

app.post('/logout', (req, res) => {
  const destroySession = () => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session during logout:', err.stack);
        return res.status(500).json({ message: 'Unable to log out.' });
      }

      return res.status(204).send();
    });
  };

  if (typeof req.logout === 'function') {
    req.logout((logoutError) => {
      if (logoutError) {
        console.error('Error clearing passport session during logout:', logoutError.stack);
        return res.status(500).json({ message: 'Unable to log out.' });
      }

      destroySession();
    });
  } else {
    destroySession();
  }
});

app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/checkout', checkoutRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

server.on('error', (error) => {
  console.error('Failed to start server on port %s:', PORT, error.stack);
});

