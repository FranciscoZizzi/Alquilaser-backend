var express = require('express');
const {makeBooking, returnBooking, cancelBooking} = require("../services/bookingService");
var router = express.Router();
const passport = require('passport');
router.use(passport.initialize());

router.post('/add', passport.authenticate('jwt', { session: false }), makeBooking);
router.post('/return', returnBooking);
router.delete('/delete/:bookingId', cancelBooking)

module.exports = router;