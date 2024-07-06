var express = require('express');
const {makeBooking, returnBooking} = require("../services/bookingService");
var router = express.Router();
const passport = require('passport');
router.use(passport.initialize());

router.post('/add', passport.authenticate('jwt', { session: false }), makeBooking);
router.post('/return', returnBooking)

module.exports = router;