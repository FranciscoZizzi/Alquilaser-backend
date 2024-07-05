var express = require('express');
var router = express.Router();
const passport = require('passport');
const session = require('express-session');
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


app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false
}));



router.use(session({ secret: process.env.JWT_SECRET, resave: false, saveUninitialized: false }));
router.use(passport.initialize());
router.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// Adjusted login endpoint to use Passport.js
router.post('/login', passport.authenticate('local', {
  successRedirect: '/', // Redirect to home page on successful login
  failureRedirect: '/login', // Redirect back to login page on failed login
  failureFlash: true // Set flash messages on failure
}));

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      // On successful authentication, generate a token and send it back
      const token = jwt.sign(
          {
            userId: req.user.googleId, // Assuming you store Google's user ID as googleId in your User model
            email: req.user.emails[0]?.value, // Assuming the first email is the primary one
          },
          process.env.JWT_SECRET,
          { expiresIn: jwtExpiresIn }
      );

      let profilePic = null;
      if (req.user.photos) {
        profilePic = req.user.photos[0].value; // Assuming the first photo URL is the profile picture
      }

      return res.status(200).json({
        success: true,
        data: {
          userId: req.user.googleId,
          email: req.user.emails[0]?.value,
          token: token,
          profilePic: profilePic
        },
      });
    }
);

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
