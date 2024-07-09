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
const app = express();
app.use(cors());


const sequelize = require("./util/database")

const { User, Listing, Image, Booking } = require('./models');

sequelize.sync()
    .then(() => {
        console.log('Database synced successfully');
    })
    .catch(err => {
        console.error('Error syncing database:', err);
    });

app.use(passport.initialize());
require('./util/passport-config');
const {startingBookingsCronjob, endingBookingsCronjob} = require("./util/cronjobs");
app.use(express.static(path.join(__dirname, '..', 'Alquilaser')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/bookings', bookingsRouter);

const PORT = process.env.PORT || 3000;

process.on('SIGINT', async () => {
    console.log('Received SIGINT signal. Dropping tables and closing server...');
    try {
        //await sequelize.drop();
        //console.log('All tables dropped successfully.');
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

startingBookingsCronjob()
endingBookingsCronjob()