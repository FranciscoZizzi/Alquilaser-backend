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
  changePasswordService,
  forgotPasswordService,
  resetPasswordService
} = require('../services/userService');


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

router.post('/forgot_password', forgotPasswordService)

router.put('/reset_password/:id/:token', resetPasswordService)

module.exports = router;
