const User = require('../models/user');
const Listing = require('../models/listing');
const Booking = require('../models/booking');
const Image = require('../models/image')
const jwt = require("jsonwebtoken");
const { authenticationService } = require("./authenticationService")
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const jwtExpiresIn = '24h';
const { Op } = require('sequelize');

exports.registerService = async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const phoneNumber = req.body.phoneNumber
    let response = {
        success: true,
        emailError: false,
        usernameError: false,
        passwordError: false,
        numberError: false,
        message: ""
    }
    if (!name || !email || !password || !phoneNumber) {
        console.log("Name, email or password missing");
        response.success = false;
        response.emailError = !email;
        response.usernameError = !name;
        response.passwordError = !password;
        response.numberError = !phoneNumber;
        response.message = "Name, email, password or phone number missing";
        return res.status(400).send(response);
    }
    let emailIsValid = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
    if(!emailIsValid) {
        console.log("invalid email");
        response.success = false;
        response.emailError = true;
        response.message = "Invalid email";
        return res.status(400).send(response);
    }

    let existingUser = await User.findOne({where: {email}});
    if (existingUser != null) {
        console.log("Email already associated with an account");
        response.success = false;
        response.emailError = true;
        response.message = "Email already associated with an account";
        return res.status(400).send(response);
    }

    if (password !== confirmPassword) {
        console.log("Password does not match confirmed password");
        response.success = false;
        response.passwordError = true;
        response.message = "Password does not match confirmed password";
        return res.status(400).send(response);
    }

    let user = await User.create({
        name,
        email,
        password,
        phone: phoneNumber
    });
    let token;
    try {
        token = jwt.sign(
            {
                userId: user.user_id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {expiresIn: jwtExpiresIn}
        );
    } catch (err) {
        console.log(err);
        response.success = false;
        response.message = "Jwt token error"
        return res.send(response);
    }
    console.log("created user " + name);

    return res.status(201).json({
        success: true,
        data: {
            userId: user.user_id,
            email: user.email,
            token: token,
        },
    });
}

exports.loginService = async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    if (!email || !password) {
        console.log('Email or password is missing');
        return res.status(400).send({
            success: false,
            emailError: !email,
            passwordError: !password,
            message: 'Email or password is missing'
        });
    }
    let user = await User.findOne({where: {email}});
    if(user == null) {
        console.log('User not found');
        return res.status(400).send({
            success: false,
            emailError: true,
            passwordError: true,
            message: 'Incorrect email or password'
        });
    }
    if(user.password !== password) {
        console.log('Incorrect password');
        return res.status(401).send({
            success: false,
            emailError: true,
            passwordError: true,
            message: 'Incorrect email or password'
        });
    }
    let token;
    try {
        token = jwt.sign(
            {
                userId: user.user_id,
                email: user.email,
            },
            process.env.JWT_SECRET,
            {expiresIn: jwtExpiresIn}
        );
    } catch (err) {
        console.log(err);
        return res.send({
            success: false,
            message: "Jwt token error"
        });
    }

    let profilePic = null;
    if (user.profile_pic != null) {
        profilePic = user.profile_pic
    }

    return res.status(200).json({
        success: true,
        data: {
            userId: user.user_id,
            email: user.email,
            token: token,
            profilePic: user.profile_pic
        },
    });
}



exports.getUserListingsService = async (req, res) => {
    let authData = await authenticationService(req, res);
    if (!authData.success) {
        return res.status(401).send("user not authenticated");
    }
    let user = await User.findByPk(authData.data.userId);

    let listings = await Listing.findAll({
        where: {
            user_id: user.user_id,
            listing_state: { [Op.ne]: 'deleted'}
        },
        include: [{
            model: Image,
            required: false,
            limit: 1
        }]
    });

    return res.status(200).json({
        success: true,
        data: {
            listings: listings
        }
    });


}

exports.getUserBookingsService = async (req, res) => {
    let authData = await authenticationService(req, res);
    if (!authData.success) {
        return res.status(401).send("user not authenticated");
    }
    let user = await User.findByPk(authData.data.userId);

    let bookings = await Booking.findAll({
        where: {
            user_id: user.user_id
        }})

    return res.status(200).json({
        success: true,
        data: {
            bookings: bookings
        }
    })
}

exports.getUserRentsService = async (req, res) => {
    let authData = await authenticationService(req, res);
    if (!authData.success) {
        return res.status(401).send("user not authenticated");
    }
    let user = await User.findByPk(authData.data.userId);
    let listings = await Listing.findAll({
        where: {
            user_id: user.user_id,
            listing_state: { [Op.ne]: 'deleted'}
        }});

    let rents = [];

    for (let i = 0; i < listings.length; i++) {
        rents = rents.concat(await Booking.findAll({where: {
                listing_id: listings[i].id
            }}))
    }

    return res.status(200).json({
        success: true,
        data: {
            rents: rents
        }
    })
}



exports.profileService = async (req, res) => {
    let authData = await authenticationService(req, res);
    if (!authData.success) {
        return res.status(401).send("user not authenticated");
    }
    let user = await User.findByPk(authData.data.userId);
    let listings = await Listing.findAll({
        where: {
            user_id: user.user_id,
            listing_state: { [Op.ne]: 'deleted'}
        }});

    let bookings = await Booking.findAll({
        where: {
            user_id: user.user_id
        }})

    let rents = [];

    for (let i = 0; i < listings.length; i++) {
        rents = rents.concat(await Booking.findAll({where: {
            listing_id: listings[i].id
            }}))
    }

    let rating = user.rating_sum / user.rating_count;

    return res.status(200).json({
        success: true,
        data: {
            name: user.name,
            phone: user.phone,
            email: user.email,
            rating: rating,
            profile_pic: user.profile_pic,
            bookings: bookings,
            rents: rents,
        }
    });
    //TODO move bookings and rents to another endpoint
}




exports.updateProfilePicService = async (req, res) => {
    let authData = await authenticationService(req, res);
    if (!authData.success) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    upload.single('profile_pic')(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            console.error('Multer error:', err);
            return res.status(400).json({ error: 'Error uploading profile picture' });
        } else if (err) {
            console.error('Unknown error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        try {
            const user = await User.findOne({ where: { user_id: authData.data.userId } });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const profilePicPath = req.file.path;
            const profilePicBuffer = fs.readFileSync(profilePicPath);

            await user.update({ profile_pic: profilePicBuffer });
            fs.unlinkSync(profilePicPath);
            return res.status(200).json({ message: 'Profile picture updated successfully' });
        } catch (error) {
            console.error('Error updating profile picture:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    });
};

exports.updateUserDataService = async (req,res) => {
    let authData = await authenticationService(req, res);
    if (!authData.success) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    const user = await User.findOne({ where: { user_id: authData.data.userId } });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    const name = req.body.name;
    const email = req.body.email;
    const phoneNumber = req.body.phoneNumber
    let existingUser = await User.findOne({where: {email}});
    let response = {
        success: true,
        emailError: false,
        usernameError: false,
        numberError: false,
        message: ""
    }
    if (!name || !email || !phoneNumber) {
        console.log("Name or email missing");
        response.success = false;
        response.emailError = !email;
        response.usernameError = !name;
        response.numberError = !phoneNumber;
        response.message = "Name, email or phone number missing";
        return res.status(400).send(response);
    }
    let emailIsValid = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
    if(!emailIsValid) {
        console.log("invalid email");
        response.success = false;
        response.emailError = true;
        response.message = "Invalid email";
        return res.status(400).send(response);
    }

    if (existingUser != null && existingUser.user_id != user.user_id) {
        console.log("Email already associated with an account");
        response.success = false;
        response.emailError = true;
        response.message = "Email already associated with an account";
        return res.status(400).send(response);
    }
    await user.update({
        name,
        email,
        phone: phoneNumber
    });
    return res.status(200).send({success: true});
}

exports.getUserById = async (req, res) => {
    const userId = req.params.id;
    if (!userId) {
        return res.status(404).send({message:"User not found"});
    }
    let user = await User.findByPk(userId);
    return user ? res.send(user) : res.status(404).send({message:"User not found"});
}
