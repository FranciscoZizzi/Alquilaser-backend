const User = require('../models/user');
const Listing = require('../models/listing');
const Booking = require('../models/booking');
const Image = require('../models/image');
const {authenticationService} = require("./authenticationService");
const multer = require('multer');
const fs = require('fs');
const {Op} = require("sequelize");
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