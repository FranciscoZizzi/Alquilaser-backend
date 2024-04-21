var express = require('express');
var router = express.Router();

const { addListingService, editListingService, deleteListingService, getListingBookings} = require('../services/listingService');
const {getListingById} = require("../services/listingService");



router.post('/add', addListingService);

router.get('/get/:id', getListingById);

router.get('/bookings/:id', getListingBookings);

router.put('/edit/:listingID', editListingService);

router.delete('/delete/:listingID', deleteListingService);



module.exports = router;
