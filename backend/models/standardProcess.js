const mongoose = require('mongoose');
const { Schema } = mongoose;

const StandardProcessSchema = new Schema({
    identifier: { type: String, required: true, unique: true, default: 'main' },
    state: {
        type: Map,
        of: [String], // e.g., { 'Tender Identification': ['std-ident-1'], ... }
        default: {}
    }
}, { timestamps: true });

StandardProcessSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('StandardProcess', StandardProcessSchema);