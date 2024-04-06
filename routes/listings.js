var express = require('express');
var router = express.Router();

const { addListingService, editListingService } = require('../services/listingService');



router.post('/add', addListingService);

router.put('/edit/:listingID', editListingService);



module.exports = router;
