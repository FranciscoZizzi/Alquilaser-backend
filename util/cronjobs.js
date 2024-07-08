var cron = require('node-cron');
const nodemailer = require("nodemailer");
const {sendEmail} = require("../services/emailService");
const Booking = require('../models/booking');
const dayjs = require('dayjs');
const {where} = require("sequelize");

exports.startingBookingsCronjob = async () => {
    cron.schedule("* * * * * *", async () => {
        //"0 0 * * *" it's supposed to run every day at 00:00
        /*
        0 0 * * *
        | | | | |
        | | | | +--- Every day of the week
        | | | +----- Every month
        | | +------- Every day of the month
        | +--------- At 0 hour (midnight)
        +----------- At 0 minute
        */
        try {
            const now = dayjs();
            let startingBookings = await Booking.findAll( {where:{id: 1}})
            startingBookings.forEach( booking => {
                    console.log(booking.start_date)
                }
            )
        } catch (error){
            console.log(error)
        }

    });
}
