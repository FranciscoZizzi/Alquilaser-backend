// user.js
const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const User = sequelize.define('User', {
    user_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    email: {
        type: Sequelize.STRING,
        unique: true
    },
    password: Sequelize.STRING,
    name: Sequelize.STRING,
    phone: Sequelize.STRING,
    rating_count: Sequelize.INTEGER,
    rating_avg: Sequelize.DECIMAL(5, 1),
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
    profile_pic: Sequelize.BLOB,
    google_id: Sequelize.STRING,
}, { freezeTableName: true });


module.exports = User;
