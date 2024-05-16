const User = require('../models/user');
const Listing = require('../models/listing');
const Booking = require('../models/booking');
const dayjs = require('dayjs');
const {authenticationService} = require("./authenticationService");
const {log} = require("debug");
const {Sequelize} = require("sequelize");

exports.makeBooking = async (req, res) => {
    const listingId = req.body.listingId;
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;

    let authData = await authenticationService(req, res);
    if (!authData.success) {
        return res.status(401).send({message: "user not authenticated"});
    }

    const userId = authData.data.userId;

    let listing = await Listing.findByPk(listingId);
    if (!listing) {
        return res.status(404).send("listing not found");
    }

    if(!startDate || !endDate){
        return res.status(401).send({message: "Select booking dates first"});
    }

    if(listing.dataValues.user_id === userId){
        return res.status(401).send({message: "you cannot book your own listing"});
    }

    let previousBookings = await Booking.findAll({where:{listing_id: listingId}})

    let startDayjs = dayjs(startDate);
    let endDayjs = dayjs(endDate);

    for (let i = 0; i < previousBookings.length; i++) {
        let previousBooking = previousBookings[i];
        if (previousBooking.returned) {
            continue;
        }

        let start = dayjs(previousBooking.start_date);
        let end = dayjs(previousBooking.end_date);
        if ((startDayjs.isAfter(start) || startDayjs.isSame(start)) && (startDayjs.isBefore(end) || startDayjs.isSame(end))) {
            return res.status(401).send({message: "Dates are already booked"});
        }
        if ((endDayjs.isAfter(start) || endDayjs.isSame(start)) && (endDayjs.isBefore(end) || endDayjs.isSame(end))) {
            return res.status(401).send({message: "Dates are already booked"});
        }
    }

    let booking = await Booking.create({
        start_date: startDate,
        end_date: endDate,
        listing_id: listingId,
        user_id: userId,
        price: listing.price,
        initial_damage: listing.damage,
        final_damage: listing.damage,
        returned: false,
    })
    console.log({
        start_date: startDate,
        end_date: endDate,
        listing_id: listingId,
        user_id: userId,
    });
    res.send(booking);
}

exports.returnBooking = async (req, res) => {
    let bookingId = req.body.bookingId;
    let extraFees = req.body.extraFees;
    let finalDamage = req.body.finalDamage;
    let rating = req.body.userRating;

    let booking = await Booking.findByPk(bookingId);
    if (!booking) {
        console.log("booking not found");
        res.status(404).send({message:"booking not found"});
    }
    let listing = await Listing.findByPk(booking.listing_id);
    if (!listing) {
        console.log("listing not found");
        res.status(404).send({message:"listing not found"});
    }
    let user = await User.findByPk(booking.user_id);
    // TODO should use a transaction but method was not recognized
    try {
        await booking.update({
            extra_fees: extraFees,
            final_damage: finalDamage,
            returned: true,
        });
        await listing.update({
            damage: finalDamage
        });
        if (user) {
            await user.update({
                rating_sum: +user.rating_sum + +rating,
                rating_count: +user.rating_count + +1
            });
        }
    } catch(error) {
        console.log(error);
        res.status(400).send(error);
    }
}