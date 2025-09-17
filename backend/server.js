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

// Connect to Database
// For serverless environments like Vercel, the connection is established once
// when the function is initialized (cold start) and reused for subsequent requests.
connectDB(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connection successful.'))
    .catch(err => console.error('MongoDB connection error:', err));


// Static file serving for uploads - explicitly add CORS for this route
// WARNING: This will NOT work in a standard Vercel deployment as the filesystem is read-only.
// For production, you must use a cloud storage service like Vercel Blob, AWS S3, etc.
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

// Export the Express app for Vercel to handle.
// Vercel will automatically handle starting the server.
module.exports = app;
