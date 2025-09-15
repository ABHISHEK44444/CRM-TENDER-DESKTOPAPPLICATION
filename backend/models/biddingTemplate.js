const mongoose = require('mongoose');

const BiddingTemplateSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    content: { type: String, required: true }
});

BiddingTemplateSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('BiddingTemplate', BiddingTemplateSchema);
