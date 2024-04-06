var express = require('express');
var router = express.Router();

const { addListingService, editListingService, deleteListingService } = require('../services/listingService');



router.post('/add', addListingService);

router.put('/edit/:listingID', editListingService);

router.delete('/delete/:listingID', deleteListingService);



module.exports = router;
