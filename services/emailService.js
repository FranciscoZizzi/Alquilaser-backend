const nodemailer = require("nodemailer");
const multer = require("multer");

exports.sendEmail = (emailAddress, subject, message) => {
    var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "alquilaser.service@gmail.com",
            pass: process.env.GOOGLE_APP_PASSWORD,
        },
    });

    var mailOptions = {
        from: "alquilaser.service@gmail.com",
        to: emailAddress,
        subject: subject,
        text: message,
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log("Email sent: " + info.response);
        }
    });
}