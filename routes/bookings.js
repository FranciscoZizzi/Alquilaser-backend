var express = require('express');
const {makeBooking} = require("../services/bookingService");
var router = express.Router();

router.post('/add', makeBooking);