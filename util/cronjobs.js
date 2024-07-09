var cron = require('node-cron');
const nodemailer = require("nodemailer");
const {sendEmail} = require("../services/emailService");
const Booking = require('../models/booking');
const dayjs = require('dayjs');
const {where} = require("sequelize");
const {getUserById} = require("../services/userService");
const User = require("../models/user");
const Listing = require('../models/listing');

exports.startingBookingsCronjob = async () => {
    cron.schedule("0 0 * * *", async () => {
        try {
            const now = dayjs().format('YYYY-MM-DDT03:00:00.000[Z]');
            let startingBookings = await Booking.findAll( {where:{start_date: now}})
            for (const booking of startingBookings) {
                let client = await User.findByPk(booking.user_id);
                let listing = await Listing.findByPk(booking.listing_id)
                let owner = await User.findByPk(listing.user_id)
                const ownerEmail = owner.email
                const clientEmail = client.email
                const emailSubject = 'A booking starts today'
                const ownerMessage = `Your listing: '${listing.title}' is being booked today!`
                const clientMessage = `Your booking for: '${listing.title}' starts today`

                sendEmail(ownerEmail,emailSubject,ownerMessage)
                sendEmail(clientEmail,emailSubject,clientMessage)
            }
        } catch (error){
            console.log(error)
        }

    });
}

exports.endingBookingsCronjob = async () => {
    cron.schedule("0 0 * * *", async () => {
        try {
            const now = dayjs().format('YYYY-MM-DDT03:00:00.000[Z]');
            let startingBookings = await Booking.findAll( {where:{end_date: now}})
            for (const booking of startingBookings) {
                let client = await User.findByPk(booking.user_id);
                let listing = await Listing.findByPk(booking.listing_id)
                let owner = await User.findByPk(listing.user_id)
                const ownerEmail = owner.email
                const clientEmail = client.email
                const emailSubject = 'A booking ends today'
                const ownerMessage = `Your listing: '${listing.title}' is being returned today!`
                const clientMessage = `Your booking for: '${listing.title}' ends today`

                sendEmail(ownerEmail,emailSubject,ownerMessage)
                sendEmail(clientEmail,emailSubject,clientMessage)
            }
        } catch (error){
            console.log(error)
        }

    });
}
exports.bookedListingCronjob = async () => {
    cron.schedule("0 0 * * *", async () => {
        try {
            const now = dayjs().format('YYYY-MM-DDT03:00:00.000[Z]');
            let startingBookings = await Booking.findAll( {where:{start_date: now}})
            for (const booking of startingBookings) {
                let listing = await Listing.findByPk(booking.listing_id)
                if(listing.listing_state === 'available') {
                    try {
                        await listing.update({
                                listing_state: 'booked'
                            }
                        );
                    } catch(error) {
                        console.log(error);
                    }
                }
            }
        } catch (e) {
            console.log(e)
        }
    });
}
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
