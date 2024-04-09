const Listing = require('../models/listing');
const {Op} = require("sequelize");

exports.searchService = async (req, res) => {
    const searchTerm = req.body.searchTerm;
    if (!searchTerm) {
        return res.status(400).send("womp womp")
    }
    let listings = await Listing.findAll({where: {title: {[Op.like]: '%' + searchTerm + '%'}}});
    return res.send(listings)
}