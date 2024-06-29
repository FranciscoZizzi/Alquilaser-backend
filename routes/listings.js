var express = require('express');
var router = express.Router();

const { addListingService, addListingImagesService, editListingService, getListingBookings } = require('../services/listingService');
const { getListingById, blockListingService } = require("../services/listingService");


router.post('/add', addListingService);

router.put('/addImages/:listingID', addListingImagesService)

router.get('/get/:id', getListingById);

router.get('/bookings/:id', getListingBookings);

router.put('/edit/:id', editListingService);

router.put('/block/:id', blockListingService)


module.exports = router;
