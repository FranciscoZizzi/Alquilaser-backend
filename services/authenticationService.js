const jwt = require("jsonwebtoken");

exports.authenticationService = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    if(!token) {
        return {
            success:false,
            data: {
                message: "Token not provided"
            }
        };
        // res.status(401).json({
        //     success: false,
        //     message: "Token not provided"
        // });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    return {
        success: true,
        data: {
            userId: decodedToken.userId,
            email: decodedToken.email
        }
    };
    // res.status(200).json(
    //     {
    //         success: true,
    //         data: {
    //             userId: decodedToken.userId,
    //             email: decodedToken.email
    //         }
    //     }
    // );
}