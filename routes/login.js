const express = require('express');
const router = express.Router();

const User = require('../models/user');

router.get('/', function(req, res, next) {
    res.render('login');
});

router.post('/', function (req, res, next) {
    let email = req.body.email;
    let password = req.body.password;
    console.log(email, password);
    if (!email || !password) {
        console.log('Email or password is missing');
        return res.status(400).send('Email or password is missing');
    }
    User.findOne({ where: {email: email}}).then(
        user => {
            if(user == null) {
                console.log('User not found');
                return res.status(404).send('User not found');
            }
            if(user.password !== password) {
                console.log('Incorrect password');
                return res.status(401).send('Incorrect password');
            }
            if(user.password === password) {
                res.redirect('/')
            }
        }).catch(err => console.log(err));
});

module.exports = router;