var express = require('express');
var router = express.Router();

const { registerService, loginService, profileService, updateProfilePicService, getUserById} = require('../services/userService');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/:id', getUserById);

router.post('/register', registerService);

router.post('/login', loginService);

router.get('/profile', profileService);

router.put('/profile', updateProfilePicService);

module.exports = router;
