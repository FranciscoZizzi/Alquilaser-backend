const User = require('../models/user');
const Listing = require('../models/listing');
const Booking = require('../models/booking');
const Image = require('../models/Image');
const {authenticationService} = require("./authenticationService");
const multer = require('multer');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });

Listing.hasMany(Image, {
    foreignKey: 'listing_id'
});
Image.belongsTo(Listing, {
    foreignKey: 'listing_id'
})

// TODO link this to index.js so as not to define relations in services files

exports.addListingImagesService = async (req, res) => {
    try {
        upload.any()(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                console.error('Multer error:', err);
                return res.status(400).json({error: 'Error uploading listing images'});
            } else if (err) {
                console.error('Unknown error:', err);
                return res.status(500).json({error: 'Internal server error'});
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
                    const image = await Image.create({ image_data: listingPicBuffer});
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
    const { title, price, description } = req.body;

    if (!title || !price || !description) {
        console.log('Some field is missing');
        return res.status(400).send({
            message: "Some field is missing"
        });
    }
    let existingListing = await Listing.findOne({where: {title}});
    if (existingListing != null) {
        console.log("There is already a publication with that title");
        return res.status(400).send({
            message: "There is already a publication with that title"
        });
    }
    let listing = await Listing.create({
        title,
        price,
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

        if (listing.user_id !== authData.data.userId) {
            return res.status(401).send({message: "Modifying listing not allowed"})
        }
        console.log(availability)
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


exports.deleteListingService = async (req, res) => {
    try {
        const listingID = req.params.listingID;

        const listing = await Listing.findByPk(listingID);
        if (!listing) {
            return res.status(404).send({
                message: "Listing not found"
            });
        }

        await listing.destroy(); // TODO por ahí no conviene hacer destroy porque rompería los historiales de reserva

        console.log("Listing deleted:", listingID);
        return res.status(200).json({
            success: true,
            message: "Listing deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting listing:", error);
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
        title: listing.title,
        price: listing.price,
        description: listing.description,
        damage: listing.damage,
        listing_state: listing.listing_state,
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
    let bookings = await Booking.findAll({where: {listing_id: listingId}});
    return res.send(bookings);
}