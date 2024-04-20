const Listing = require('../models/listing');
const {Op} = require("sequelize");

exports.filteredSearch = async (req, res) => {
    let priceMinFilter = req.query.priceMinFilter;
    let priceMaxFilter = req.query.priceMaxFilter;
    let searchTerm = req.body.searchTerm;
    let listings = []
    if (priceMinFilter == null) {
        priceMinFilter = '0';
    }
    if (searchTerm == null) {
        searchTerm = '';
    }
    if (priceMaxFilter != null) {
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
    if (priceMaxFilter == null) {
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

// exports.searchByTitle = async (req, res) => {
//     const searchTerm = req.body.searchTerm;
//     let listings
//         if (!searchTerm) {
//             return res.status(400).send("womp womp")
//         }
//     listings = await Listing.findAll({where: {title: {[Op.like]: '%' + searchTerm + '%'}}});
//     return res.send(listings)
// }
//
// searchByPrice = async (req, res) => {
//     const searchTerm = req.body.searchTerm;
//     const priceFilterMin = req.body.priceFilterMin;
//     const priceFilterMax = req.body.priceFilterMax;
//     let listings = await Listing.findAll({
//         where: {
//             title: {[Op.like]: '%' + searchTerm + '%'},
//             price: {
//                 [Op.gte]: priceFilterMin,
//                 [Op.lte]: priceFilterMax,
//             }
//         }
//     })
//     return listings
// }
//
// exports.searchByListingState = async (req, res) => {
//     const searchTerm = req.body.searchTerm;
//     const stateFilter = req.body.stateFilter
//     let listings = await Listing.findAll({
//         where: {
//             title: {[Op.like]: '%' + searchTerm + '%'},
//             listing_state: {[Op.like]:stateFilter}
//         }
//     })
//     return res.send(listings)
// }