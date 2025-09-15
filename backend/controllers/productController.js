const Product = require('../models/product');
const { saveFileFromDataUrl } = require('../utils/tenderUtils');

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({}).sort({ name: 1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createProduct = async (req, res) => {
    try {
        const newProductData = { ...req.body };

        if (newProductData.documents && Array.isArray(newProductData.documents)) {
            newProductData.documents = await Promise.all(newProductData.documents.map(async (doc) => {
                 if (doc.url && doc.url.startsWith('data:')) {
                    const newUrl = await saveFileFromDataUrl(doc.url);
                    return { ...doc, url: newUrl };
                }
                return doc;
            }));
        }

        if (newProductData.id.startsWith('prod_')) {
             newProductData.id = `prod${Date.now()}`;
        }
        const product = await Product.create(newProductData);
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getProduct = async (req, res) => {
    try {
        const product = await Product.findOne({ id: req.params.id });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const updateData = req.body;
        const existingProduct = await Product.findOne({ id: req.params.id });
        if (!existingProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (updateData.documents && Array.isArray(updateData.documents)) {
            updateData.documents = await Promise.all(updateData.documents.map(async (doc) => {
                const isNewDocWithDataUrl = doc.url && doc.url.startsWith('data:') && !existingProduct.documents.some(d => d.id === doc.id);
                if (isNewDocWithDataUrl) {
                    const newUrl = await saveFileFromDataUrl(doc.url);
                    return { ...doc, url: newUrl };
                }
                return doc;
            }));
        }

        const product = await Product.findOneAndUpdate({ id: req.params.id }, updateData, { new: true, runValidators: true });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({ id: req.params.id });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllProducts,
    createProduct,
    getProduct,
    updateProduct,
    deleteProduct
};