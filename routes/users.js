var express = require('express');
var router = express.Router();

const { registerService, loginService, decodeToken } = require('../services/userService');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res) {
    res.render('register');
});

router.post('/register', registerService);

router.get('/login', function(req, res) {
    res.render('login');
});

router.post('/login', loginService);

router.get('/login', function(req, res) {
    res.render('login');
});

router.get('/accessResource', decodeToken);

router.post('/login', loginService);

module.exports = router;
