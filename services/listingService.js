const Listing = require('../models/listing');


exports.addListingService = async (req, res) => {
    const { title, price, description, damage, listingState } = req.body;

    if (!title || !price || !description || !damage || !listingState) {
        console.log('Some field is missing');
        return res.status(400).send('Some field is missing');
    }
    let existingListing = await Listing.findOne({where: {title}});
    if (existingListing != null) {
        console.log("There is already a publication with that title");
        // TODO devolver JSON
        return res.status(400).send("There is already a publication with that title");
    }
    let listing = await Listing.create({
        title,
        price,
        description,
        damage,
        listing_state: listingState
        //TODO snake_case / camelCase?
    });
    console.log("created listing " + title);
    return res.status(201).send(listing.toJSON())
}

exports.editListingService = async (req, res) => {
    try {
        const listingID = req.params.listingID;
        const { title, price, description, damage, listingState } = req.body;

        // Find the existing listing
        let listing = await Listing.findByPk(listingID);
        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        // Update the listing fields
        listing.title = title;
        listing.price = price;
        listing.description = description;
        listing.damage = damage;
        listing.listingState = listingState;

        // Save the updated listing
        await listing.save();

        console.log("Listing updated:", listing.title);
        return res.status(200).json(listing.toJSON());
    } catch (error) {
        console.error("Error updating listing:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};