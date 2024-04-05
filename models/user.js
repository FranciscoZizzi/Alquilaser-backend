const Sequelize = require('sequelize');

const sequelize = require('../util/database');

module.exports = (sequelize, DataTypes) => {
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
        // TODO encriptar?
        password: Sequelize.STRING,
        name: Sequelize.STRING,
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
        profile_pic: DataTypes.BLOB
    });

    User.associate = models => {
        User.hasMany(models.Booking);
    };

    return User;
};

