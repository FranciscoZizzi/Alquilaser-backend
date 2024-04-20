const User = require('./user');
const Listing = require('./listing');
const Image = require('./image');
const Booking = require('./booking');
const sequelize = require("../util/database");

User.hasMany(Booking);
User.hasMany(Listing);
Listing.belongsTo(User, {
    foreignKey: 'user_id'
});
Listing.hasMany(Image);
Listing.hasMany(Booking);
Booking.belongsTo(User);
Booking.belongsTo(Listing);

// (async () => {
//     await sequelize.sync({ force: true });
//     await User.create({
//         name: "user",
//         email: "user@email.com",
//         password: "password"
//     })
//     await Listing.create({
//         title: "Listing1",
//         price: 20,
//         description: "This is the listing 1",
//         damage: "No damage",
//         listing_state: "Available",
//         user_id: 1,
//     })
//     await Listing.create({
//         title: "Listing2",
//         price: 5,
//         description: "This is the listing 2",
//         damage: "Destroyed",
//         listing_state: "Available",
//         user_id: 1,
//     })
// })();