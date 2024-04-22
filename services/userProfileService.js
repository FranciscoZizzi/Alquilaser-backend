const { User, Booking, Listing } = require('../models');

exports.getUserProfile = async (req, res) => {
    try {
        const userID = req.params.userID;
        // Find the user
        const user = await User.findByPk(userID);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find all bookings associated with the user
        const bookings = await Booking.findAll({ where: { user_id: userID } });

        // Find all listings associated with the user
        const listings = await Listing.findAll({ where: { user_id: userID } });

        // Construct the user profile object
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
