const express = require('express');
const router = express.Router();

const User = require('../models/user');
const { loginService } = require('../services/userService')

router.get('/', function(req, res, next) {
    res.render('login');
});

router.post('/', loginService);

module.exports = router;