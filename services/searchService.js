const Listing = require('../models/listing');
const {Op} = require("sequelize");

exports.searchByTitle = async (req, res) => {
    const searchTerm = req.body.searchTerm;
    if (!searchTerm) {
        return res.status(400).send("womp womp")
    }
    let listings = await Listing.findAll({where: {title: {[Op.like]: '%' + searchTerm + '%'}}});
    return res.send(listings)
}

exports.searchByPrice = async (req, res) => {
    const searchTerm = req.body.searchTerm;
    const priceFilterMax = req.body.priceFilterMax;
    const priceFilterMin = req.body.priceFilterMin;
    if(!searchTerm){
        return res.status(400).send('Not found')
    }
    let listings = await Listing.findAll({
        where: {
            title: {[Op.like]: '%' + searchTerm + '%'},
            price: {
                [Op.gte]: priceFilterMin,
                [Op.lte]: priceFilterMax,
            }
        }
    })
    return res.send(listings)
}

exports.searchByListingState = async (req, res) => {
    const searchTerm = req.body.searchTerm;
    const stateFilter = req.body.stateFilter
    if(!searchTerm){
        return res.status(400).send('Not found')
    }
    let listings = await Listing.findAll({
        where: {
            title: {[Op.like]: '%' + searchTerm + '%'},
            listing_state: {[Op.like]:stateFilter}
        }
    })
    return res.send(listings)
}