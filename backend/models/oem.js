const mongoose = require('mongoose');

const OemSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    contactPerson: { type: String },
    email: { type: String },
    phone: { type: String },
    website: { type: String },
    area: { type: String },
    region: { type: String },
    accountManager: { type: String },
    accountManagerStatus: { type: String, enum: ['Active', 'Inactive'] }
}, { timestamps: true });

OemSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('OEM', OemSchema);
