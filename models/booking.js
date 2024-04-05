const Sequelize = require('sequelize');

const sequelize = require('../util/database');

module.exports = (sequelize, DataTypes) => {
    const Booking = sequelize.define('Booking', {
        start_date: DataTypes.DATE,
        end_date: DataTypes.DATE,
        initial_damage: DataTypes.STRING,
        final_damage: DataTypes.STRING,
        price: DataTypes.INTEGER,
        extra_fees: DataTypes.INTEGER
    });

    Booking.associate = models => {
        Booking.belongsTo(models.User);
        Booking.belongsTo(models.Listing);
    };

    return Booking;
};
