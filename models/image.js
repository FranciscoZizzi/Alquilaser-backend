const Sequelize = require('sequelize');

const sequelize = require('../util/database');

module.exports = (sequelize, DataTypes) => {
    const Image = sequelize.define('Image', {
        image_data: DataTypes.BLOB
    });

    Image.associate = models => {
        Image.belongsTo(models.Listing);
    };

    return Image;
};
