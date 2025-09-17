const mongoose = require('mongoose');
const { Schema } = mongoose;

const FinancialRequestSchema = new Schema({
    id: { type: String, required: true, unique: true },
    tenderId: { type: String, ref: 'Tender', required: true },
    type: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, required: true },
    requestedById: { type: String, ref: 'User', required: true },
    requestDate: { type: String, required: true },
    notes: String,
    approverId: { type: String, ref: 'User' },
    approvalDate: String,
    rejectionReason: String,
    instrumentDetails: {
        mode: String,
        processedDate: String,
        expiryDate: String,
        issuingBank: String,
        documentUrl: String
    }
}, { timestamps: true });

// Add index for sorting performance
FinancialRequestSchema.index({ requestDate: -1 });

FinancialRequestSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('FinancialRequest', FinancialRequestSchema);
