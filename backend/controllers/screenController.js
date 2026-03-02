const Screen = require('../models/Screen');

exports.createScreen = async (req, res) => {
    try {
        const { screenName, theatreId, totalSeats } = req.body;

        const newScreen = new Screen({
            screenName,
            theatreId,
            totalSeats
        });

        await newScreen.save();

        res.status(201).json({
            message: "Screen created successfully",
            screen: newScreen
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};