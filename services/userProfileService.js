const { User, Booking, Listing } = require('../models');

exports.getUserProfile = async (req, res) => { // TODO no tiene usages, estamos usando otro service
    try {
        const userID = req.params.userID;
        // Find the user
        const user = await User.findByPk(userID);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const bookings = await Booking.findAll({
            where: { user_id: userID },
            order: [['end_date', 'DESC']]
        });

        const listings = await Listing.findAll({ where: { user_id: userID } });

        const userProfile = {
            user: user.toJSON(),
            bookings: bookings.map(booking => booking.toJSON()),
            listings: listings.map(listing => listing.toJSON())
        };

        res.status(200).json(userProfile);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

