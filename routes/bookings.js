var express = require('express');
const {makeBooking, returnBooking} = require("../services/bookingService");
var router = express.Router();

router.post('/add', makeBooking);
router.post('/return', returnBooking)

module.exports = router;