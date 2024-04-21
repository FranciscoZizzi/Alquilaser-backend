const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Booking = sequelize.define('Booking', {
    start_date: Sequelize.DATE, // Se puede cambiar a DATEONLY para que no tenga hora
    end_date: Sequelize.DATE,
    initial_damage: Sequelize.STRING,
    final_damage: Sequelize.STRING,
    price: Sequelize.INTEGER,
    extra_fees: Sequelize.INTEGER
}, { freezeTableName: true });

module.exports = Booking;
