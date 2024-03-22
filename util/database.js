require('dotenv').config();

const database = process.env.MYSQL_DATABASE;
const user = process.env.MYSQL_USER
const password = process.env.MYSQL_PASSWORD;
const host = process.env.MYSQL_HOST;

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(database, user, password, {
    dialect: 'mysql',
    host: host
});

module.exports = sequelize;