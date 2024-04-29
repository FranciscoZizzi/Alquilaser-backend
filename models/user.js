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
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
    profile_pic: Sequelize.BLOB
}, { freezeTableName: true });


module.exports = User;
