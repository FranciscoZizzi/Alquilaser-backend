const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Image = sequelize.define('Image', {
    image_data: Sequelize.BLOB
}, { freezeTableName: true });

module.exports = Image;
