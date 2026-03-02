const Theatre = require('../models/Theatre');

exports.createTheatre = async (req, res) => {
    try {
        const { name, location, city } = req.body;

        const newTheatre = new Theatre({
            name,
            location,
            city
        });

        await newTheatre.save();

        res.status(201).json({
            message: "Theatre created successfully",
            theatre: newTheatre
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};