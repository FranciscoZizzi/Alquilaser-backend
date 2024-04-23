const Listing = require('../models/listing');
const Image = require('../models/Image');
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
        let listings = await Listing.findAll({
            where: {
                title: {
                    [Op.like]: '%' + searchTerm + '%'
                },
                price: {
                    [Op.gte]: priceMinFilter,
                }
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
                }
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
