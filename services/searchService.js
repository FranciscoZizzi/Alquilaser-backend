const Listing = require('../models/listing');
const {Op} = require("sequelize");

exports.filteredSearch = async (req, res) => {
    let priceMinFilter = req.query.priceMinFilter;
    let priceMaxFilter = req.query.priceMaxFilter;
    let searchTerm = req.body.searchTerm;
    let listings = []
    if (priceMinFilter == null || priceMinFilter === '') {
        priceMinFilter = '0';
    }
    if (searchTerm == null) {
        searchTerm = '';
    }
    if (priceMaxFilter != null &&  priceMaxFilter !== '') {
        listings = await Listing.findAll({
            where: {
                title: {
                    [Op.like]: '%' + searchTerm + '%'
                },
                price: {
                    [Op.gte]: priceMinFilter,
                    [Op.lte]: priceMaxFilter,
                }
            }
        });
        return res.send(listings)
    }
    if (priceMaxFilter == null  || priceMaxFilter === '') {
        listings = await Listing.findAll({
            where: {
                title: {
                    [Op.like]: '%' + searchTerm + '%'
                },
                price: {
                    [Op.gte]: priceMinFilter,
                }
            }
        });
        return res.send(listings)
    }
}

exports.getListingById = (req, res) => {
    const listingId = req.params.id;
    if (!listingId) {
        res.status(404).send("Listing not found");
    }

}
