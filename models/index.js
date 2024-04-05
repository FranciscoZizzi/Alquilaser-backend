const User = require('./user');
const Listing = require('./listing');
const Image = require('./image');
const Booking = require('./booking');

User.hasMany(Booking);
Listing.hasMany(Image);
Listing.hasMany(Booking);
Booking.belongsTo(User);
Booking.belongsTo(Listing);