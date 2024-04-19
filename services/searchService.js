const Listing = require('../models/listing');
const {Op} = require("sequelize");

exports.filteredSearch = async (req, res) => {
    let priceFilterMin = req.body.min;
    let priceFilterMax = req.body.max;
    let searchTerm = req.body.searchTerm;
    let listings = []
    if (priceFilterMin == null) {
        priceFilterMin = '0';
    }
    if (searchTerm == null) {
        searchTerm = '';
    }
    if (priceFilterMax != null) {
        listings = await Listing.findAll({
            where: {
                title: {
                    [Op.like]: '%' + searchTerm + '%'
                },
                price: {
                    [Op.gte]: priceFilterMin,
                    [Op.lte]: priceFilterMax,
                }
            }
        });
        return res.send(listings)
    }
    if (priceFilterMax == null) {
        listings = await Listing.findAll({
            where: {
                title: {
                    [Op.like]: '%' + searchTerm + '%'
                },
                price: {
                    [Op.gte]: priceFilterMin,
                }
            }
        });
        return res.send(listings)
    }
}