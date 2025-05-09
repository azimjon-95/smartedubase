const Balans = require('../models/balans');

// Create new Balans
exports.createBalans = async (req, res) => {
    try {
        const newBalans = new Balans(req.body);
        await newBalans.save();
        res.status(201).json(newBalans);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


// Get all Balans
exports.getAllBalans = async (req, res) => {
    try {
        const balans = await Balans.find();
        res.status(200).json(balans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single Balans by ID
exports.getBalansById = async (req, res) => {
    try {
        const balans = await Balans.findById(req.params.id);
        if (!balans) {
            return res.status(404).json({ message: 'Balans not found' });
        }
        res.status(200).json(balans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Balans by ID
exports.updateBalans = async (req, res) => {
    try {
        const updatedBalans = await Balans.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedBalans) {
            return res.status(404).json({ message: 'Balans not found' });
        }
        res.status(200).json(updatedBalans);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete Balans by ID
exports.deleteBalans = async (req, res) => {
    try {
        const deletedBalans = await Balans.findByIdAndDelete(req.params.id);
        if (!deletedBalans) {
            return res.status(404).json({ message: 'Balans not found' });
        }
        res.status(200).json({ message: 'Balans deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//===============================================
