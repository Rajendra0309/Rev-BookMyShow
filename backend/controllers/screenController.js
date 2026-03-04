const Screen = require('../models/Screen');
const Seat = require('../models/Seat');

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

// 🔹 Get Seats by Screen ID
exports.getSeatsByScreenId = async (req, res) => {
    try {
        const { screenId } = req.params;

        const seats = await Seat.find({ screenId });

        if (seats.length === 0) {
            return res.status(404).json({ message: "No seats found for this screen" });
        }

        res.status(200).json(seats);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};