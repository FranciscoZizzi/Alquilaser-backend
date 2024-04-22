var express = require('express');
var router = express.Router();

const { addListingService, addListingImagesService, editListingService, deleteListingService } = require('../services/listingService');
const {getListingById} = require("../services/listingService");



router.post('/add', addListingService);

router.put('/addImages', addListingImagesService)

router.get('/get/:id', getListingById)

router.put('/edit/:listingID', editListingService);

router.delete('/delete/:listingID', deleteListingService);



module.exports = router;
