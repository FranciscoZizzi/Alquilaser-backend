const User = require('../models/user');

exports.registerService = async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    // TODO manejar confirm password en el front
    const confirmPassword = req.body.confirmPassword;
    if (!name || !email || !password) {
        console.log("Name, email or password missing");
        return res.status(400).send("Name, email or password missing");
    }
    let emailIsValid = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
    if(!emailIsValid) {
        console.log("invalid email");
        // TODO devolver JSON
        return res.status(400).send("Invalid email");
    }
    if (password !== confirmPassword) {
        console.log("Password does not match confirmed password");
        // TODO devolver JSON
        return res.status(400).send("Password does not match confirmed password");
    }

    let existingUser = await User.findOne({where: {email}});
    if (existingUser != null) {
        console.log("Email already associated with an account");
        // TODO devolver JSON
        return res.status(400).send("Email already associated with an account");
    }
    let user = await User.create({
        name,
        email,
        password
    });
    console.log("created user " + name);
    return res.status(201).send(user.toJSON())
}

exports.loginService = async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    if (!email || !password) {
        console.log('Email or password is missing');
        // TODO devolver JSON
        return res.status(400).send('Email or password is missing');
    }
    let user = await User.findOne({where: {email}});
    if(user == null) {
        console.log('User not found');
        // TODO devolver JSON
        return res.status(404).send('User not found');
    }
    if(user.password !== password) {
        console.log('Incorrect password');
        // TODO devolver JSON
        return res.status(401).send('Incorrect password');
    }
    if(user.password === password) {
        return res.status(201).send(user.toJSON())
    }
}