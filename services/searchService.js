const Listing = require('../models/listing');
const Image = require('../models/Image');
const {Op} = require("sequelize");

exports.filteredSearch = async (req, res) => {
    let priceMinFilter = req.query.priceMinFilter;
    let priceMaxFilter = req.query.priceMaxFilter;
    let maxRatingFilter = req.query.maxRatingFilter;
    let searchTerm = req.query.searchTerm;
    if (priceMinFilter == null || priceMinFilter === '') {
        priceMinFilter = '0';
    }
    if (searchTerm == null) {
        searchTerm = '';
    }
    if(maxRatingFilter == null){
        maxRatingFilter = 5;
    }
    console.log("REQ RATING");
    console.log(maxRatingFilter);
    if (priceMaxFilter != null &&  priceMaxFilter !== '') {
        let listings = await Listing.findAll({
            where: {
                title: {
                    [Op.like]: '%' + searchTerm + '%'
                },
                price: {
                    [Op.gte]: priceMinFilter,
                    [Op.lte]: priceMaxFilter,
                },
                req_rating: {[Op.lte]: maxRatingFilter},
                listing_state: { [Op.ne]: 'deleted'}
            },
            include: [{
                model: Image,
                required: false,
                limit: 1

            }]
        });
        return res.send(listings)
    }
    if (priceMaxFilter == null  || priceMaxFilter === '') {
        let listings = await Listing.findAll({
            where: {
                title: {
                    [Op.like]: '%' + searchTerm + '%'
                },
                price: {
                    [Op.gte]: priceMinFilter,
                },
                req_rating: {[Op.lte]: maxRatingFilter},
                listing_state: { [Op.ne]: 'deleted'}
            },
            include: [{
                model: Image,
                required: false,
                limit: 1
            }]
        });
        return res.send(listings)
    }
}
