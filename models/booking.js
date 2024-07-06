const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Booking = sequelize.define('Booking', {
    start_date: Sequelize.DATE,
    end_date: Sequelize.DATE,
    initial_damage: Sequelize.STRING,
    final_damage: Sequelize.STRING,
    price: Sequelize.INTEGER,
    extra_fees: Sequelize.INTEGER,
    returned: Sequelize.BOOLEAN,
    hidden: Sequelize.BOOLEAN
}, { freezeTableName: true });

module.exports = Booking;
