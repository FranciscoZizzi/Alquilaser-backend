const express = require('express');
const router = express.Router();

const { registerService } = require('../services/userService');

router.get('/', function(req, res, next) {
    res.render('register');
});

router.post('/', registerService);

module.exports = router;