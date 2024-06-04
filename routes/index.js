var express = require('express');
const {filteredSearch} = require("../services/searchService");
var router = express.Router();


router.post('/search', filteredSearch);


module.exports = router;
