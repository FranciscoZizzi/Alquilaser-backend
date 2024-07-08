var express = require('express');
var router = express.Router();
const passport = require('passport');
router.use(passport.initialize());

const {makeBooking, returnBooking, cancelBooking} = require("../services/bookingService");

router.post('/add', passport.authenticate('jwt', { session: false }), makeBooking);
router.post('/return', returnBooking);
router.delete('/delete/:bookingId', cancelBooking); // TODO autenticación no funca con esta ruta específica

module.exports = router;