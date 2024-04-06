const express = require('express');
const router = express.Router();
const userProfileService = require('../services/userProfileService');


router.get('/:userID', function(req, res) {
    res.render(':userID');
});

module.exports = router;
