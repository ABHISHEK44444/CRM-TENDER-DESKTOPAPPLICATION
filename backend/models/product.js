const mongoose = require('mongoose');

const TenderDocumentSchema = new mongoose.Schema({
    id: String,
    name: String,
    url: String,
    type: String,
    mimeType: String,
    uploadedAt: String,
    uploadedById: String
}, { _id: false });


const ProductSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    documents: [TenderDocumentSchema]
}, { timestamps: true });


ProductSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});


module.exports = mongoose.model('Product', ProductSchema);
