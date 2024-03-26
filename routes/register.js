const express = require('express');
const router = express.Router();

const User = require('../models/user');

router.get('/', function(req, res, next) {
    res.render('register');
});

router.post('/', async function (req, res, next) {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    // TODO verificar formato email
    if (!name || !email || !password) {
        console.log("Name, email or password missing");
        return res.status(400).send("Name, email or password missing");
    }
    if (password !== confirmPassword) {
        console.log("Password does not match confirmed password");
        return res.status(400).send("Password does not match confirmed password");
    }
    let existingUser = await User.findOne({where: email});
    if (existingUser != null) {
        console.log("Email already associated with an account");
        return res.status(400).send("Email already associated with an account");
    }
    await User.create({
        name,
        email,
        password
    });
    console.log("created user " + name);
    res.redirect('/');
});

module.exports = router;