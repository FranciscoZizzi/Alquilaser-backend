const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Image = sequelize.define('Image', {
    image_data: Sequelize.BLOB
}, { freezeTableName: true });

Image.associate = models => {
    Image.belongsTo(models.Listing);
};

module.exports = Image;
