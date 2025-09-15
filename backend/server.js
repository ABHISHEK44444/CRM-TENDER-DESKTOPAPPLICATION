require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db/connect');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const tenderRoutes = require('./routes/tenders');
const clientRoutes = require('./routes/clients');
const userRoutes = require('./routes/users');
const oemRoutes = require('./routes/oems');
const productRoutes = require('./routes/products');
const financialRequestRoutes = require('./routes/financialRequests');
const dataRoutes = require('./routes/data');


const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase payload size limit for file uploads

// Static file serving for uploads - explicitly add CORS for this route
app.use('/uploads', cors(), express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tenders', tenderRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/users', userRoutes);
app.use('/api/oems', oemRoutes);
app.use('/api/products', productRoutes);
app.use('/api/financial-requests', financialRequestRoutes);
app.use('/api/data', dataRoutes);


// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5001;

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');
        app.listen(PORT, () => console.log(`Server is listening on port ${PORT}...`));
    } catch (error) {
        console.log(error);
    }
};

start();
