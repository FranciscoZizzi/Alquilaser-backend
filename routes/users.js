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
  resetPasswordService,
  emailValidationService, validateUserEmail
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
        failureRedirect: 'http://localhost:3002/login'
    }),
    (req, res) => {
        const userWithToken = req.user;
        const redirectUrl = `http://localhost:3002/store-token/${encodeURIComponent(userWithToken.token)}`;
        res.redirect(redirectUrl);
    },
);

router.get('/get/:id', getUserById);

router.get('/listings', passport.authenticate('jwt', { session: false }) ,getUserListingsService);

router.get('/bookings', passport.authenticate('jwt', { session: false }), getUserBookingsService);

router.get('/rents', passport.authenticate('jwt', { session: false }), getUserRentsService);

router.post('/register', registerService);

router.post('/login', loginService);

router.get('/profile', passport.authenticate('jwt', { session: false }), profileService);

router.put('/profile', passport.authenticate('jwt', { session: false }), updateProfilePicService);

router.put('/edit', passport.authenticate('jwt', { session: false }), updateUserDataService);

router.put('/change_password', changePasswordService)

router.post('/forgot_password', forgotPasswordService)

router.put('/reset_password/:id/:token', resetPasswordService)

router.post('/validate_email/:id', emailValidationService)

router.put('/validate_user_email', validateUserEmail)

module.exports = router;
