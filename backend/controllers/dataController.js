const Department = require('../models/department');
const Designation = require('../models/designation');
const BiddingTemplate = require('../models/biddingTemplate');

const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find({}).sort({ name: 1 });
        res.status(200).json(departments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDesignations = async (req, res) => {
    try {
        const designations = await Designation.find({}).sort({ name: 1 });
        res.status(200).json(designations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTemplates = async (req, res) => {
    try {
        const templates = await BiddingTemplate.find({}).sort({ name: 1 });
        res.status(200).json(templates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const saveTemplate = async (req, res) => {
    try {
        let template;
        if (req.params.id && !req.body.id.startsWith('temp_')) { // Update
             template = await BiddingTemplate.findOneAndUpdate({ id: req.params.id }, req.body, { new: true, runValidators: true });
        } else { // Create
            const newTemplateData = { ...req.body, id: `temp${Date.now()}` };
            template = await BiddingTemplate.create(newTemplateData);
        }
        if (!template) {
            return res.status(404).json({ message: 'Template not found for update' });
        }
        res.status(200).json(template);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteTemplate = async (req, res) => {
    try {
        const template = await BiddingTemplate.findOneAndDelete({ id: req.params.id });
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }
        res.status(200).json({ message: 'Template deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    getDepartments,
    getDesignations,
    getTemplates,
    saveTemplate,
    deleteTemplate,
};
