var express = require('express');
const {searchService} = require("../services/searchService");
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/search', searchService);

module.exports = router;
