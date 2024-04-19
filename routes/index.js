var express = require('express');
const {searchByTitle, filteredSearch} = require("../services/searchService");
const {searchByPrice, searchByListingState} = require("../services/searchService");
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/search', filteredSearch);


module.exports = router;
