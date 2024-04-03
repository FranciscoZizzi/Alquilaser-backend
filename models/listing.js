const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Listing = sequelize.define('listing', {
    listing_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    part_name: {
        type: Sequelize.STRING
    },
    price: {
        type: Sequelize.INTEGER
    },
    description: {
        type: Sequelize.STRING
    },
    damage: {
        type: Sequelize.STRING
    },
    listing_state: {
        type: Sequelize.STRING
    }
});

module.exports = Listing;