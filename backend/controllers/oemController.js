const OEM = require('../models/oem');

const getAllOems = async (req, res) => {
    try {
        const oems = await OEM.find({}).sort({ name: 1 });
        res.status(200).json(oems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createOem = async (req, res) => {
    try {
        const newOemData = { ...req.body, id: `oem${Date.now()}` };
        const oem = await OEM.create(newOemData);
        res.status(201).json(oem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getOem = async (req, res) => {
    try {
        const oem = await OEM.findOne({ id: req.params.id });
        if (!oem) {
            return res.status(404).json({ message: 'OEM not found' });
        }
        res.status(200).json(oem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateOem = async (req, res) => {
    try {
        const oem = await OEM.findOneAndUpdate({ id: req.params.id }, req.body, { new: true, runValidators: true });
        if (!oem) {
            return res.status(404).json({ message: 'OEM not found' });
        }
        res.status(200).json(oem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteOem = async (req, res) => {
    try {
        const oem = await OEM.findOneAndDelete({ id: req.params.id });
        if (!oem) {
            return res.status(404).json({ message: 'OEM not found' });
        }
        res.status(200).json({ message: 'OEM deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    getAllOems,
    createOem,
    getOem,
    updateOem,
    deleteOem
};
