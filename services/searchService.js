const Listing = require('../models/listing');
const {Op} = require("sequelize");

exports.filteredSearch = async (req, res) => {
    const priceFilterMin = req.body.priceFilterMin;
    const priceFilterMax = req.body.priceFilterMax;
    const searchTerm = req.body.searchTerm;
    let listings = []

    if(!priceFilterMax && !priceFilterMin){
        if(!searchTerm){
            listings =  await Listing.findAll()
            return res.send(listings)
        }
        listings = await Listing.findAll({where: {title: {[Op.like]: '%' + searchTerm + '%'}}})
        return res.send(listings)
    }
    if(priceFilterMax && priceFilterMin){
        if(!searchTerm){
            listings = await Listing.findAll({
                where: {
                    price: {
                        [Op.gte]: priceFilterMin,
                        [Op.lte]: priceFilterMax,
                    }
                }
            })
            return res.send(listings)
        }
        listings = await Listing.findAll({
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


}

exports.searchByTitle = async (req, res) => {
    const priceFilterMin = req.body.priceFilterMin;
    const priceFilterMax = req.body.priceFilterMax;
    const searchTerm = req.body.searchTerm;
    let listings
    if(!priceFilterMax && !priceFilterMin){
        if (!searchTerm) {
            return res.status(400).send("womp womp")
        }
        listings = await Listing.findAll({where: {title: {[Op.like]: '%' + searchTerm + '%'}}});
        console.log(listings)
        return res.send(listings)
    }
    if(priceFilterMax || priceFilterMin){
        listings = await searchByPrice(req,res)
    }
    return res.send(listings)
}

searchByPrice = async (req, res) => {
    const searchTerm = req.body.searchTerm;
    const priceFilterMin = req.body.priceFilterMin;
    const priceFilterMax = req.body.priceFilterMax;
    let listings = await Listing.findAll({
        where: {
            title: {[Op.like]: '%' + searchTerm + '%'},
            price: {
                [Op.gte]: priceFilterMin,
                [Op.lte]: priceFilterMax,
            }
        }
    })
    return listings
}

exports.searchByListingState = async (req, res) => {
    let listings = await Listing.findAll({
        where: {
            title: {[Op.like]: '%' + searchTerm + '%'},
            listing_state: {[Op.like]:stateFilter}
        }
    })
    return res.send(listings)
}