const jwt = require("jsonwebtoken");
const User = require("../models/user")

exports.authenticationService = async (req, res) => {
    if (!req.headers.authorization) {
        return {
            success:false,
        }
    }
    const token = req.headers.authorization.split(' ')[1];
    if(!token) {
        return {
            success:false,
        };
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if(!decodedToken || !decodedToken.userId || !decodedToken.email) {
        return {
            success:false,
        };
    }
    console.log(decodedToken)
    let user = await User.findOne({where: {id: decodedToken.userId}})
    if (!user) {
        return {
            success:false,
        };
    }
    console.log(user)
    return {
        success: true,
        data: {
            userId: decodedToken.userId,
            email: decodedToken.email
        }
    };
}