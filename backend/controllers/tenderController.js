const Tender = require('../models/tender');
const Client = require('../models/client');
const { createDocumentFromUpload, saveFileFromDataUrl } = require('../utils/tenderUtils');

const getAllTenders = async (req, res) => {
    try {
        const tenders = await Tender.find({}).sort({ createdAt: -1 });
        res.status(200).json(tenders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createTender = async (req, res) => {
    try {
        const client = await Client.findOne({ id: req.body.clientId });
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        
        const newTenderData = {
            ...req.body,
            id: `ten${Date.now()}`,
            clientName: client.name,
            status: 'Drafting',
            workflowStage: 'Tender Identification',
            history: [{
                userId: req.body.assignedTo ? req.body.assignedTo[0] : 'system',
                user: 'System', // This should be improved with actual user data
                action: 'Created Tender',
                timestamp: new Date().toISOString(),
            }],
        };
        const tender = await Tender.create(newTenderData);
        res.status(201).json(tender);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const importTender = async (req, res) => {
     try {
        let client = await Client.findOne({ name: req.body.clientName });
        if (!client) {
            client = await Client.create({
                id: `cli${Date.now()}`,
                name: req.body.clientName || 'Unknown Client',
                industry: 'Unknown',
                gstin: '',
                status: 'Lead',
                category: 'Imported'
            });
        }
        
        const { uploadedFile, ...tenderData } = req.body;

        const documents = await createDocumentFromUpload(uploadedFile, tenderData.assignedTo);
        
        const newTenderData = {
            ...tenderData,
            id: `ten${Date.now()}`,
            clientId: client.id,
            clientName: client.name,
            status: 'Drafting',
            workflowStage: 'Tender Identification',
             history: [{
                userId: tenderData.assignedTo ? tenderData.assignedTo[0] : 'system',
                user: 'System',
                action: 'Imported Tender',
                timestamp: new Date().toISOString(),
                details: uploadedFile ? `Imported from file: ${uploadedFile.name}` : 'Imported with manual data.'
            }],
            documents: documents,
        };
        const tender = await Tender.create(newTenderData);
        res.status(201).json(tender);
    } catch (error) {
        console.error("Error importing tender:", error);
        res.status(400).json({ message: error.message });
    }
};

const getTender = async (req, res) => {
    try {
        const tender = await Tender.findOne({ id: req.params.id });
        if (!tender) {
            return res.status(404).json({ message: 'Tender not found' });
        }
        res.status(200).json(tender);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTender = async (req, res) => {
    try {
        const updateData = req.body;
        const existingTender = await Tender.findOne({ id: req.params.id });

        if (!existingTender) {
            return res.status(404).json({ message: 'Tender not found' });
        }
        
        // Process any new document uploads
        if (updateData.documents && Array.isArray(updateData.documents)) {
            updateData.documents = await Promise.all(updateData.documents.map(async (doc) => {
                // If it's a new doc (no ID in existing docs) and has a data URL
                const isNewDocWithDataUrl = doc.url && doc.url.startsWith('data:') && !existingTender.documents.some(d => d.id === doc.id);
                if (isNewDocWithDataUrl) {
                    const newUrl = await saveFileFromDataUrl(doc.url);
                    return { ...doc, url: newUrl };
                }
                return doc;
            }));
        }

        const tender = await Tender.findOneAndUpdate({ id: req.params.id }, updateData, { new: true, runValidators: true });

        res.status(200).json(tender);
    } catch (error) {
        console.error("Error updating tender:", error);
        res.status(400).json({ message: error.message });
    }
};

const deleteTender = async (req, res) => {
    try {
        const tender = await Tender.findOneAndDelete({ id: req.params.id });
        if (!tender) {
            return res.status(404).json({ message: 'Tender not found' });
        }
        res.status(200).json({ message: 'Tender deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const respondToAssignment = async (req, res) => {
    const { id } = req.params;
    const { userId, status, notes } = req.body;
    try {
        const tender = await Tender.findOne({ id });
        if (!tender) {
            return res.status(404).json({ message: 'Tender not found' });
        }

        const response = {
            status,
            notes: notes || undefined,
            respondedAt: new Date().toISOString(),
        };

        if (!tender.assignmentResponses) {
            tender.assignmentResponses = new Map();
        }
        tender.assignmentResponses.set(userId, response);
        
        await tender.save();
        res.status(200).json(tender);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getAllTenders,
    createTender,
    getTender,
    updateTender,
    deleteTender,
    importTender,
    respondToAssignment
};