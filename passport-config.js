const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { query } = require('./db');

module.exports = function passportConfig(passport) {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const userQuery = await query('SELECT * FROM users WHERE username = $1', [username]);
        if (!userQuery.rows.length) {
          return done(null, false, { message: 'No user found' });
        }

        const user = userQuery.rows[0];
        const passwordMatches = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatches) {
          return done(null, false, { message: 'Password incorrect' });
        }

        const { password_hash, ...safeUser } = user;
        return done(null, safeUser);
      } catch (error) {
        console.error('Error during authentication for user %s:', username, error.stack);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const userQuery = await query('SELECT * FROM users WHERE id = $1', [id]);
      if (!userQuery.rows.length) {
        return done(new Error(`User with id ${id} not found`));
      }

      const { password_hash, ...safeUser } = userQuery.rows[0];
      return done(null, safeUser);
    } catch (error) {
      console.error('Error during deserialization for user ID %s:', id, error.stack);
      return done(error);
    }
  });
};
