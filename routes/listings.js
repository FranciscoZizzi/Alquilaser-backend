var express = require('express');
var router = express.Router();

const { addListingService, editListingSerivce } = require('../services/listingService');



router.post('/add', addListingService);

//router.put('/:listingID', editListingSerivce);



module.exports = router;
