const User = require('./user');
const Listing = require('./listing');
const Image = require('./image');
const Booking = require('./booking');
const sequelize = require("../util/database");

User.hasMany(Booking);
User.hasMany(Listing);
Listing.belongsTo(User);
Listing.hasMany(Image);
Listing.hasMany(Booking);
Booking.belongsTo(User);
Booking.belongsTo(Listing);