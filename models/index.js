const User = require('./user');
const Listing = require('./listing');
const Image = require('./image');
const Booking = require('./booking');
const sequelize = require("../util/database");

User.hasMany(Booking);
Booking.belongsTo(User);

User.hasMany(Listing, {
    foreignKey: 'user_id'
});
Listing.belongsTo(User, {
    foreignKey: 'user_id'
});

Listing.hasMany(Image, {
    foreignKey: 'listing_id'
});
Image.belongsTo(Listing, {
    foreignKey: 'listing_id'
})

Listing.hasMany(Booking, {
    foreignKey: 'listing_id'
});
Booking.belongsTo(Listing, {
    foreignKey: 'listing_id'
});