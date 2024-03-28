const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const cors = require('cors');

const app = express();
app.use(cors());

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

module.exports = app