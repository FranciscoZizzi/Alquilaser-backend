const User = require('../models/user');
const Listing = require('../models/listing');
const Booking = require('../models/booking');
const {authenticationService} = require("./authenticationService");

exports.makeBooking = async (req, res) => {
    const userId = req.body.userId;
    const listingId = req.body.listingId;
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;

    let authData = authenticationService(req, res);
    if (!authData.success) {
        return res.status(401).send("user not authenticated");
    }

    let listing = await Listing.findByPk(listingId);
    if (!listing) {
        return res.status(404).send("listing not found");
    }
    let booking = await Booking.create({
        start_date: startDate,
        end_date: endDate,
        listing_id: listingId,
        user_id: userId,
        // TODO price se podría manejar en el front
    })
    res.send(booking);
}