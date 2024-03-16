const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { query } = require('./db');

module.exports = function(passport) {
    passport.use(new LocalStrategy(
        async (username, password, done) => {
            try {
                const userQuery = await query('SELECT * FROM users WHERE username = $1', [username]);
                if (userQuery.rows.length > 0) {
                    const user = userQuery.rows[0];
                    // Compare hashed password
                    if (await bcrypt.compare(password, user.password_hash)) {
                        console.log(`User authenticated successfully: ${username}`);
                        return done(null, user);
                    } else {
                        console.log(`Password incorrect for user: ${username}`);
                        return done(null, false, { message: 'Password incorrect' });
                    }
                } else {
                    console.log(`No user found with username: ${username}`);
                    return done(null, false, { message: 'No user found' });
                }
            } catch (err) {
                console.error(`Error during authentication for user ${username}:`, err.stack);
                return done(err);
            }
        }
    ));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const userQuery = await query('SELECT * FROM users WHERE id = $1', [id]);
            if (userQuery.rows.length > 0) {
                const user = userQuery.rows[0];
                done(null, user);
            } else {
                done(new Error(`User with id ${id} not found`), null);
            }
        } catch (err) {
            console.error(`Error during deserialization for user ID ${id}:`, err.stack);
            done(err, null);
        }
    });
};