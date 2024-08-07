const User = require('../models/user');
const Listing = require('../models/listing');
const Booking = require('../models/booking');
const dayjs = require('dayjs');
const {authenticationService} = require("./authenticationService");
const {log} = require("debug");
const {Sequelize} = require("sequelize");
const {sendEmail} = require("./emailService");

exports.makeBooking = async (req, res) => {
    const listingId = req.body.listingId;
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;

    const userId = req.user.user_id;
    let user = await User.findByPk(userId);

    if (!user.email_validated){
        return res.status(405).send({message: "Validate your email address"});
    }

    let listing = await Listing.findByPk(listingId);
    if (!listing) {
        return res.status(404).send("listing not found");
    }

    if (!startDate || !endDate) {
        return res.status(401).send({message: "Select booking dates first"});
    }

    if (listing.dataValues.user_id === userId) {
        return res.status(401).send({message: "you cannot book your own listing"});
    }

    if (listing.listing_state === "damaged") {
        return res.status(401).send({message: "Part is damaged"});
    }

    if (listing.req_rating !== null && user.rating_avg !== null) {
        if(user.rating_avg < listing.req_rating){
            return res.status(402).send({message:"User doesnt have required minimum rating"})
        }
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

        if (dateRangesOverlap(startDayjs, endDayjs, start, end)) {
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
        hidden: false
    })
    console.log({
        start_date: startDate,
        end_date: endDate,
        listing_id: listingId,
        user_id: userId,
    });
    let start = dayjs(booking.start_date);
    let end = dayjs(booking.end_date);
    if ((dayjs().isAfter(start) || dayjs().isSame(start)) && (dayjs().isBefore(end) || dayjs().isSame(end))) {
        try {
            await listing.update({
                    listing_state: 'booked'
                }
            );
        } catch(error) {
            console.log(error);
            res.status(400).send(error);
        }
    }
    return res.send(booking);
}

dateRangesOverlap = (dateStartA, dateEndA, dateStartB, dateEndB) => {
    if ((dateStartA.isAfter(dateStartB) || dateStartA.isSame(dateStartB)) && (dateStartA.isBefore(dateEndB) || dateStartA.isSame(dateEndB))) {
        return true;
    }
    if ((dateEndA.isAfter(dateStartB) || dateEndA.isSame(dateStartB)) && (dateEndA.isBefore(dateEndB) || dateEndA.isSame(dateEndB))) {
        return true;
    }
    if ((dateStartB.isAfter(dateStartA) || dateStartB.isSame(dateStartA)) && (dateStartB.isBefore(dateEndA) || dateStartB.isSame(dateEndA))) {
        return true;
    }
    return false;
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

    let ratingCount = (user.rating_count == null) ? 0 : user.rating_count
    let ratingAvg = (user.rating_avg == null) ? 0 : user.rating_avg
    const updatedAvg = (Number(ratingAvg * ratingCount) + Number(rating))/(ratingCount + 1)

    try {
        await booking.update({
            extra_fees: extraFees,
            final_damage: finalDamage,
            returned: true,
        });
        await listing.update({
            damage: finalDamage,
            listing_state: "available"
        });
        if (user) {
            await user.update({
                rating_avg: updatedAvg,
                rating_count: ratingCount + 1
            });
        }
        res.status(200).send("success");
    } catch(error) {
        console.log(error);
        res.status(400).send(error);
    }
}

exports.cancelBooking = async (req, res) => {
    let bookingId = req.params.bookingId;
    // let userId = req.user.user_id;


    let booking = await Booking.findByPk(bookingId);

    if (!booking) {
        return res.status(404).send({message:"booking not found, try again later"});
    }

    // if (booking.user_id !== userId) {
    //     return res.status(401).send({message:"You are not allowed to cancel this booking"});
    // }

    let startDate = dayjs(booking.start_date);

    if (dayjs().isAfter(startDate.subtract(1, 'd'))) {
        return res.status(401).send({message:"bookings must be canceled with more than one day of anticipation"})
    }

    await booking.destroy();

    let listing = await Listing.findByPk(booking.listing_id);
    let owner = await User.findByPk(listing.user_id);
    let client = await User.findByPk(booking.user_id);
    // console.log(owner.email, "A client has cancelled their booking", `${client.name} has cancelled their booking for ${listing.title} from ${booking.start_date.toString().split('00:')[0]} to ${booking.end_date.toString().split('00:')[0]}`)
    sendEmail(owner.email, "A client has cancelled their booking", `${client.name} has cancelled their booking for ${listing.title} from ${booking.start_date.toString().split('00:')[0]} to ${booking.end_date.toString().split('00:')[0]}`);
    return res.status(200).send({message:"booking canceled successfully"});
}