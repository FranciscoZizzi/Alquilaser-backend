const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const config = require('./config/config.json');
const Sequelize = require('sequelize');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const listingsRouter = require('./routes/listings');
const bookingsRouter = require('./routes/bookings');
const cors = require('cors');
const passport = require('passport');
require('./util/passport-config');
const app = express();
app.use(cors());

const session = require('express-session');


app.use(session({
    secret: 'your_secret_key', // A secret key to sign the session ID cookie
    resave: false, // Forces the session to be saved back to the session store
    saveUninitialized: true, // Forces a session that is "uninitialized" to be saved to the store
    cookie: {
        secure: false, // Set to true if your site is served over HTTPS
        httpOnly: true, // Makes the cookie inaccessible to client-side JavaScript
        maxAge: 86400000 // Session max age in milliseconds (24 hours)
    }
}));

const sequelize = require("./util/database")

const { User, Listing, Image, Booking } = require('./models');

sequelize.sync({ force: false })
    .then(() => {
        console.log('Database synced successfully');
    })
    .catch(err => {
        console.error('Error syncing database:', err);
    });

app.use(express.static(path.join(__dirname, '..', 'Alquilaser')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/bookings', bookingsRouter);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

const PORT = process.env.PORT || 3000;

process.on('SIGINT', async () => {
    console.log('Received SIGINT signal. Dropping tables and closing server...');
    try {
        // await sequelize.drop();
        // console.log('All tables dropped successfully.');
        await sequelize.close();
        console.log('Sequelize connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('Error occurred while dropping tables or closing connection:', error);
        process.exit(1);
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;