var express = require('express');
var router = express.Router();
const passport = require('passport');
const app = express();

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


router.use(passport.initialize());


router.get(
    '/google',
    passport.authenticate('google', {
      scope: ['profile', 'email'],
    }),
);

router.get(
    '/google/callback',
    passport.authenticate('google', {
      session: false,
        successRedirect: 'http://localhost:3002/',
        failureRedirect: 'http://localhost:3002/login'
    }),
    (req, res) => {
      const token = req.user.generateJWT();
      res.cookie('x-auth-cookie', token);
      res.redirect('http://localhost:3002/');
    },
);

router.get('/get/:id', getUserById);

router.get('/listings', passport.authenticate("local", { session: false }) ,getUserListingsService);

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
