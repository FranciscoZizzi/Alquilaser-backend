var express = require('express');
const {searchByTitle} = require("../services/searchService");
const {searchByPrice, searchByListingState} = require("../services/searchService");
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/search', searchByTitle);

router.post('/search',searchByPrice);
router.post('/search',searchByListingState);

module.exports = router;
