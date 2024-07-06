var express = require('express');
var router = express.Router();
const passport = require('passport');
router.use(passport.initialize());

const { addListingService, addListingImagesService, editListingService, getListingBookings } = require('../services/listingService');
const { getListingById, blockListingService } = require("../services/listingService");


router.post('/add', passport.authenticate('jwt', { session: false }), addListingService);

router.put('/addImages/:listingID', passport.authenticate('jwt', { session: false }), addListingImagesService)

router.get('/get/:id', getListingById);

router.get('/bookings/:id', getListingBookings);

router.put('/edit/:id', passport.authenticate('jwt', { session: false }), editListingService);

router.put('/block/:id', passport.authenticate('jwt', { session: false }), blockListingService)


module.exports = router;
