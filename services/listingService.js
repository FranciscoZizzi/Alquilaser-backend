const User = require('../models/user');
const Listing = require('../models/listing');
const Booking = require('../models/booking');
const Image = require('../models/image');
const {authenticationService} = require("./authenticationService");
const multer = require('multer');
const fs = require('fs');
const {Op} = require("sequelize");
const dayjs = require("dayjs");
const nodemailer = require("nodemailer");
const {sendEmail} = require("./emailService");
const upload = multer({ dest: 'uploads/' });

exports.addListingImagesService = async (req, res) => {
    try {
        upload.any()(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                console.error('Multer error:', err);
                return res.status(400).json({message: 'Error uploading listing images'});
            } else if (err) {
                console.error('Unknown error:', err);
                return res.status(500).json({message: 'Internal server error'});
            }
            const authData = await authenticationService(req, res);
            if (!authData.success) {
                console.log("Not logged in");
                return res.status(401).send({
                    message: "Not logged in"
                });
            }

            // Assuming you have the listing ID from the request or another source
            const listingId = req.params.listingID;
            const listing = await Listing.findByPk(listingId);

            if (!listing) {
                return res.status(404).send({
                    message: "Listing not found"
                });
            }

            // Handle uploaded files
            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    const listingPicPath = file.path;
                    const listingPicBuffer = fs.readFileSync(listingPicPath);
                    console.log(listingId)
                    let image;
                    try {
                        image = await Image.create({image_data: listingPicBuffer})
                    }
                    catch(e) {
                        console.log(e)
                        await listing.destroy();
                        return res.status(400).json({message: 'Error uploading listing images'})
                    }
                    await listing.addImage(image);
                    fs.unlinkSync(listingPicPath);
                }
            }

            console.log("Added images for listing: " + listing.title);
            return res.status(201).json({
                success: true,
                data: listing
            });
        });
    } catch (error) {
        console.error('Error adding listing:', error);
        return res.status(500).send({
            message: "Internal server error"
        });
    }
};




exports.addListingService = async (req, res) => {
    const authData = await authenticationService(req, res);
    if (!authData.success) {
        console.log("Not logged in")
        return res.status(401).send({
            message: "Not logged in"
        })
    }
    const { title, price, description, req_rating } = req.body;

    if (!title || !price || !description) {
        console.log('Some field is missing');
        return res.status(400).send({
            message: "Some field is missing"
        });
    }
    let existingListing = await Listing.findOne({
        where: {
            title,
            listing_state:{
                [Op.ne]: 'deleted'
            }
        }});

    if (existingListing != null) {
        console.log("There is already a publication with that title");
        return res.status(400).send({
            message: "There is already a publication with that title"
        });
    }

    let listing = await Listing.create({
        title,
        price,
        req_rating,
        description,
        damage: "no",
        listing_state: "available",
        user_id: authData.data.userId
    });
    console.log("created listing " + title);
    return res.status(201).json({
        success: true,
        data: {
            ...listing,
            listing_id: listing.id
        }
    })
}


exports.editListingService = async (req, res) => {
    try {
        const authData = await authenticationService(req, res);
        if (!authData.success) {
            console.log("Not logged in")
            return res.status(401).send({
                message: "Not logged in"
            })
        }
        const listingId = req.params.id;
        const { title, rate, description, availability } = req.body;

        let listing = await Listing.findByPk(listingId);
        if (!listing) {
            return res.status(404).send({
                message: "Listing not found"
            });
        }
        if (listing.title !== title) {
            let existingListing = await Listing.findOne({where: {title}});
            if (existingListing && existingListing.listing_state !== "deleted") {
                return res.status(401).send({message: "Listing with title already exists"});
            }
        }

        if (listing.user_id !== authData.data.userId) {
            return res.status(401).send({message: "Modifying listing not allowed"})
        }

        if (availability === "available") {
            let previousBookings = await Booking.findAll({where: {listing_id: listingId}});

            let now = dayjs();

            for (let i = 0; i < previousBookings.length; i++) {
                let previousBooking = previousBookings[i];
                if (previousBooking.returned) {
                    continue;
                }

                let start = dayjs(previousBooking.start_date);
                let end = dayjs(previousBooking.end_date);
                if ((now.isAfter(start) || now.isSame(start)) && (now.isBefore(end) || now.isSame(end))) {
                    if (previousBooking.hidden) {
                        await previousBooking.destroy();
                    } else {
                        return res.status(401).send({message: "Listing is currently booked"})
                    }
                }
            }
        }

        listing.title = title;
        listing.price = rate;
        listing.description = description;
        listing.listing_state = availability;

        await listing.save();

        console.log("Listing updated:", listing.title);
        return res.status(200).send({
            success: true,
            data: listing
        });
    } catch (error) {
        console.error("Error updating listing:", error);
        return res.status(500).send({
            message: "Internal Server Error"
        });
    }
};

exports.blockListingService = async (req, res) => {
    const listingId = req.params.id;
    const reason = req.body.reason;
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;

    let authData = await authenticationService(req, res);
    if (!authData.success) {
        return res.status(401).send({message: "user not authenticated"});
    }

    const userId = authData.data.userId;

    let listing = await Listing.findByPk(listingId);
    if (!listing) {
        return res.status(404).send({message: "Listing not found"});
    }

    if (!startDate || !endDate) {
        return res.status(401).send({message: "Select dates first"});
    }

    let previousBookings = await Booking.findAll({where:{listing_id: listingId}})

    let blockStartDay = dayjs(startDate);
    let blockEndDay = dayjs(endDate);

    for (let i = 0; i < previousBookings.length; i++) {
        let previousBooking = previousBookings[i];
        if (previousBooking.returned) {
            continue;
        }

        let client = await User.findByPk(previousBooking.user_id);

        let bookingStartDay = dayjs(previousBooking.start_date);
        let bookingEndDay = dayjs(previousBooking.end_date);

        if (dateRangesOverlap(blockStartDay, blockEndDay, bookingStartDay, bookingEndDay)) {
            if ((dayjs().isAfter(bookingStartDay) || dayjs().isSame(bookingStartDay)) && (dayjs().isBefore(bookingEndDay) || dayjs().isSame(bookingEndDay))) {
                return res.status(401).send({message: "There is an active booking"})
            }
            await previousBooking.destroy();
            if (client) {
                sendEmail(client.email, "Booking Canceled", `Your booking for ${listing.title} has been canceled`);
            }
        }
    }

    let booking = await Booking.create({
        start_date: startDate,
        end_date: endDate,
        listing_id: listingId,
        user_id: userId,
        price: 0,
        initial_damage: listing.damage,
        final_damage: listing.damage,
        returned: false,
        hidden: true,
    });

    let start = dayjs(booking.start_date);
    let end = dayjs(booking.end_date);
    if ((dayjs().isAfter(start) || dayjs().isSame(start)) && (dayjs().isBefore(end) || dayjs().isSame(end))) {
        try {
            await listing.update({
                    listing_state: reason
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

exports.getListingById = async (req, res) => {
    const listingId = req.params.id;
    if (!listingId) {
        return res.status(404).send({message:"User not found"});
    }
    let listing = await Listing.findByPk(listingId);
    if (!listing) {
        return res.status(404).send({message:"Listing not found"});
    }
    let owner = await User.findByPk(listing.user_id)

    const listing_images = await Image.findAll({
        where: { listing_id: listingId }
    });
    let mapImages = listing_images.map(image => ({
        id: image.id,
        data: image.image_data
    }))
    console.log(mapImages)

    let result = {
        id: listing.id,
        title: listing.title,
        price: listing.price,
        description: listing.description,
        damage: listing.damage,
        listing_state: listing.listing_state,
        req_rating: listing.req_rating,
        owner: owner.name,
        images: mapImages
    }
    return res.send(result);
}

exports.getListingBookings = async (req, res) => {
    const listingId = req.params.id;
    if (!listingId) {
        return res.status(404).send({message:"Listing not found"});
    }
    let listing = await Listing.findByPk(listingId);
    if (!listing) {
        return res.status(404).send({message:"Listing not found"});
    }
    let bookings = await Booking.findAll({where: {listing_id: listingId, returned: false}});
    return res.send(bookings);
}