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
var nodemailer = require("nodemailer");
const {sendEmail} = require("./emailService");

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
        phone: phoneNumber,
        rating_count: 1,
        rating_avg: 3.0
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
    let user = await User.findByPk(req.user.user_id);

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
    try {


        let user = await User.findByPk(req.user.user_id);

        let bookings = await Booking.findAll({
            where: {
                user_id: user.user_id
            },
            include: [{
                model: Listing,
                include: [{
                    model: User,
                    attributes: ['name']
                }]
            }]
        });

        const bookingsWithOwner = bookings.map(booking => {
            const bookingJson = booking.toJSON();
            bookingJson.listingOwner = booking.Listing.User.name;
            return bookingJson;
        });

        return res.status(200).json({
            success: true,
            data: {
                bookings: bookingsWithOwner
            }
        });
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


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
                listing_id: listings[i].id,
                hidden: false
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
    try {
        let user = await User.findByPk(req.user.user_id);
        let listings = await Listing.findAll({
            where: {
                user_id: user.user_id,
                listing_state: { [Op.ne]: 'deleted'}
            }
        });

        let bookings = await Booking.findAll({
            where: {
                user_id: user.user_id,
                hidden: false
            },
            include: [{
                model: Listing,
                include: [{
                    model: User,
                    attributes: ['name']
                }]
            }]
        });

        // Fetch rents without including the owner information
        let rents = [];
        for (let i = 0; i < listings.length; i++) {
            const bookingResults = await Booking.findAll({
                where: { listing_id: listings[i].id, hidden: false },
                order: [['end_date', 'DESC']]
            });
            rents = rents.concat(bookingResults);
        }

        // Sort the rents array by end_date in descending order
        rents.sort((a, b) => new Date(b.end_date) - new Date(a.end_date));

        // Map bookings to include the owner information
        const bookingsWithOwner = bookings.map(booking => {
            const bookingJson = booking.toJSON();
            bookingJson.owner = booking.Listing.User.name;
            return bookingJson;
        });

        return res.status(200).json({
            success: true,
            data: {
                name: user.name,
                phone: user.phone,
                email: user.email,
                rating: user.rating_avg,
                profile_pic: user.profile_pic,
                bookings: bookingsWithOwner,
                rents: rents.map(rent => rent.toJSON()) // Convert rents to JSON without modifying the structure
            }
        });
    } catch (error) {
        console.error("Error fetching profile data:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


exports.updateProfilePicService = async (req, res) => {
    upload.single('profile_pic')(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            console.error('Multer error:', err);
            return res.status(400).json({ error: 'Error uploading profile picture' });
        } else if (err) {
            console.error('Unknown error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        try {
            const user = await User.findOne({ where: { user_id: req.user.user_id } });
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
    const user = await User.findOne({ where: { user_id: req.user.user_id } });
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


exports.changePasswordService = async(req,res) => {
    let authData = await authenticationService(req, res);
    if (!authData.success) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    const prevPassword = req.body.prevPassword
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const user = await User.findOne({ where: { user_id: authData.data.userId } });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    let response = {
        success: true,
        matchingPasswordError: false,
        wrongPasswordError: false,
    }
    if(!password){
        response.success = false;
        wrongPasswordError = true;
        response.message = "Password must not be empty"
        return res.status(400).send(response)
    }
    if(prevPassword !== user.password){
        console.log("Previous password is incorrect")
        response.success = false;
        response.wrongPasswordError = true;
        response.message = "Incorrect password";
        return res.status(400).send(response)
    }
    if (password !== confirmPassword) {
        console.log("Password does not match confirmed password");
        response.success = false;
        response.matchingPasswordError = true;
        response.message = "Password does not match confirmed password";
        return res.status(400).send(response);
    }
    console.log("Updated user password")
    await user.update({password})

    return res.status(200).send({success: true});
}

exports.forgotPasswordService = async(req,res) => {
    const email  = req.body.email;
    try {
        const oldUser = await User.findOne({where: {email}});
        if (!oldUser) {
            console.log("User not found")
            return res.json({ status: "User not found" });
        }
        const secret = process.env.JWT_SECRET + oldUser.password;
        const token = jwt.sign({ email: oldUser.email, id: oldUser.user_id }, secret, {
            expiresIn: "5m",
        });
        const link = `http://localhost:3002/reset_password/${oldUser.user_id}/${token}`;
        var transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "alquilaser.service@gmail.com",
                pass: process.env.GOOGLE_APP_PASSWORD,
            },
        });

        var mailOptions = {
            from: "alquilaser.service@gmail.com",
            to: email,
            subject: "Password Reset",
            text: `Reset your password using the following link:\n\n ${link}`,
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email sent: " + info.response);
            }
        });
        console.log("Sent email")
        console.log(link);
    } catch (error) {
        console.log(error)
    }
};

exports.resetPasswordService = async (req, res) => {
    const id = req.params.id;
    const token = req.params.token
    const { password, confirmPassword } = req.body;
    console.log("User id: " + id)
    console.log(token)

    if(password !== confirmPassword){
        return res.status(400).send("Password doesnt match");
    }

    const oldUser = await User.findOne({where: {user_id: id}});
    if (!oldUser) {
        return res.status(401).send("User not found");
    }
    console.log("Found old user")
    const secret = process.env.JWT_SECRET + oldUser.password;
    try {
        const verify = jwt.verify(token, secret);
        await oldUser.update({password})

    } catch (error) {
        console.log(error);
        res.json({ status: "Something Went Wrong" });
    }
}

exports.emailValidationService = async (req,res) => {
    console.log("Asdasdasddas")
    const email = req.body.email;
    try {
        const user = await User.findOne({where: {email}});
        if (!user) {
            return res.status(404).json({error: 'User not found'});
        }

        const link = `http://localhost:3002/validate_email?userId=${user.user_id}`;
        const subject = "Email validation"
        const text = `Validate your mail using the following link:\n\n ${link}`
        sendEmail(email, subject,text)
        console.log("Sent email")
        console.log(link);
    } catch (error){
        console.log(error);
        res.json({ status: "Something Went Wrong" });
    }
}
exports.validateUserEmail = async (req,res) => {
    const user = await User.findOne({ where: { user_id: req.body.user_id } });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    if(user.email_validated){
        return res.status(404).json({ error: 'User already validated' });
    }
    try {
        await user.update({
            email_validated: true
        });
    } catch (error){
        console.log(error)
        res.json({ status: "Something Went Wrong" });
    }

    console.log("user email validated")
    return res.status(200).send({success: true});
}
