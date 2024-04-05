const Sequelize = require('sequelize');

const sequelize = require('../util/database');

module.exports = (sequelize, DataTypes) => {
    const Listing = sequelize.define('Listing', {
        part_name: DataTypes.STRING,
        price: DataTypes.INTEGER,
        description: DataTypes.STRING,
        damage: DataTypes.STRING,
        listing_state: DataTypes.STRING
    });

    Listing.associate = models => {
        Listing.hasMany(models.Image);
        Listing.hasMany(models.Booking);
    };

    return Listing;
};
