const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String },
    email: { type: String },
    phone: { type: String },
    isPrimary: { type: Boolean, default: false }
});

const HistoryLogSchema = new mongoose.Schema({
    userId: { type: String },
    user: { type: String },
    action: { type: String },
    timestamp: { type: String },
    details: { type: String }
});

const InteractionLogSchema = new mongoose.Schema({
    id: { type: String, required: true },
    type: { type: String, enum: ['Call', 'Email', 'Meeting'] },
    notes: { type: String },
    userId: { type: String },
    user: { type: String },
    timestamp: { type: String }
});

const ClientSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    industry: { type: String },
    gstin: { type: String },
    revenue: { type: Number },
    joinedDate: { type: String },
    contacts: [ContactSchema],
    status: { type: String, enum: ['Active', 'Lead', 'Dormant', 'Lost'] },
    category: { type: String },
    source: { type: String },
    notes: { type: String },
    history: [HistoryLogSchema],
    potentialValue: { type: Number },
    clientHealth: { type: String, enum: ['Excellent', 'Good', 'At-Risk'] },
    interactions: [InteractionLogSchema]
}, { timestamps: true });


ClientSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});


module.exports = mongoose.model('Client', ClientSchema);
