var express = require('express');
var router = express.Router();

const { registerService, loginService, profileService } = require('../services/userService');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', registerService);

router.post('/login', loginService);

router.get('/profile', profileService);

module.exports = router;
