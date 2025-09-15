const FinancialRequest = require('../models/financialRequest');
const Tender = require('../models/tender');

const getAllRequests = async (req, res) => {
    try {
        const requests = await FinancialRequest.find({}).sort({ requestDate: -1 });
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createRequest = async (req, res) => {
    try {
        const newRequestData = {
            ...req.body,
            id: `finreq${Date.now()}`,
            requestDate: new Date().toISOString(),
            status: 'Pending Approval'
        };
        const request = await FinancialRequest.create(newRequestData);
        res.status(201).json(request);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getRequest = async (req, res) => {
    try {
        const request = await FinancialRequest.findOne({ id: req.params.id });
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        res.status(200).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const request = await FinancialRequest.findOneAndUpdate({ id }, updateData, { new: true, runValidators: true });
        
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // If request is processed, update the tender's financial details
        if (updateData.status === 'Processed' && updateData.instrumentDetails) {
            const tender = await Tender.findOne({ id: request.tenderId });
            if (tender) {
                const instrument = {
                    amount: request.amount,
                    mode: updateData.instrumentDetails.mode,
                    submittedDate: updateData.instrumentDetails.processedDate,
                    documentUrl: updateData.instrumentDetails.documentUrl,
                };
                if (request.type.startsWith('EMD')) {
                    tender.emd = { ...instrument, type: 'EMD', expiryDate: updateData.instrumentDetails.expiryDate, refundStatus: 'Under Process' };
                } else if (request.type === 'Tender Fee') {
                    tender.tenderFee = instrument;
                } else if (request.type === 'PBG') {
                    tender.pbg = { ...instrument, type: 'PBG', expiryDate: updateData.instrumentDetails.expiryDate, issuingBank: updateData.instrumentDetails.issuingBank, status: 'Active' };
                }
                await tender.save();
            }
        }
        
        res.status(200).json(request);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteRequest = async (req, res) => {
    try {
        const request = await FinancialRequest.findOneAndDelete({ id: req.params.id });
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        res.status(200).json({ message: 'Request deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllRequests,
    createRequest,
    getRequest,
    updateRequest,
    deleteRequest
};
