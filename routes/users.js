var express = require('express');
var router = express.Router();

const { registerService,
  loginService,
  profileService, updateProfilePicService,
  getUserListingsService,
  getUserById,
    updateUserDataService,
  getUserBookingsService,
  getUserRentsService,
  changePasswordService
} = require('../services/userService');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/get/:id', getUserById);

router.get('/listings', getUserListingsService);

router.get('/bookings', getUserBookingsService);

router.get('/rents', getUserRentsService);

router.post('/register', registerService);

router.post('/login', loginService);

router.get('/profile', profileService);

router.put('/profile', updateProfilePicService);

router.put('/edit', updateUserDataService);

router.put('/change_password', changePasswordService)

module.exports = router;
