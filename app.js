const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const config = require('./config/config.json');
const { Sequelize } = require('sequelize');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const cors = require('cors');

const app = express();
app.use(cors());

// Database configuration
const { database, username, password, host, dialect } = config.development;
const sequelize = new Sequelize(database, username, password, {
    host: host,
    dialect: dialect
});

// Import models
const User = require('./models/user')(sequelize, Sequelize);
const Listing = require('./models/listing')(sequelize, Sequelize);
const Booking = require('./models/booking')(sequelize, Sequelize);
const Image = require('./models/image')(sequelize, Sequelize);

sequelize.sync({ force: true })
    .then(() => {
        console.log('Database synced successfully');
    })
    .catch(err => {
        console.error('Error syncing database:', err);
    });

// Serve static files from the Alquilaser directory (frontend)
app.use(express.static(path.join(__dirname, '..', 'Alquilaser')));

// Body parser middleware for handling POST requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.use('/api', indexRouter); // Example API route
app.use('/api/users', usersRouter); // Example users API route

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
