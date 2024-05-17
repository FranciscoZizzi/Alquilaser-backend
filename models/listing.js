const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Listing = sequelize.define('Listing', {
    title: Sequelize.STRING,
    price: Sequelize.INTEGER,
    req_rating: Sequelize.DECIMAL(5, 1),
    description: Sequelize.TEXT('long'),
    damage: Sequelize.TEXT('long'),
    listing_state: Sequelize.STRING
}, { freezeTableName: true });

module.exports = Listing;
