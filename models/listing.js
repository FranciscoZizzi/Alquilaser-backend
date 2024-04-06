const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Listing = sequelize.define('Listing', {
    title: Sequelize.STRING,
    price: Sequelize.INTEGER,
    description: Sequelize.STRING,
    damage: Sequelize.STRING,
    listing_state: Sequelize.STRING
}, { freezeTableName: true });

Listing.associate = models => {
    Listing.hasMany(models.Image);
    Listing.hasMany(models.Booking);
};

module.exports = Listing;
