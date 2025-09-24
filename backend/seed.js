require('dotenv').config();
const connectDB = require('./db/connect');

// Import models
const User = require('./models/user');
const Client = require('./models/client');
const Tender = require('./models/tender');
const OEM = require('./models/oem');
const Product = require('./models/product');
const FinancialRequest = require('./models/financialRequest');
const Department = require('./models/department');
const Designation = require('./models/designation');
const BiddingTemplate = require('./models/biddingTemplate');
const StandardProcess = require('./models/standardProcess');

// Import mock data (you'll need to copy this from your frontend constants.tsx)
const {
    MOCK_DEPARTMENTS, MOCK_DESIGNATIONS, MOCK_USERS, MOCK_CLIENTS,
    MOCK_OEMS, MOCK_PRODUCTS, MOCK_TENDERS, MOCK_FINANCIAL_REQUESTS,
    MOCK_BIDDING_TEMPLATES
} = require('./seedData');

const seedDatabase = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        console.log('Connected to database...');

        // Clear existing data
        console.log('Clearing existing data...');
        await Promise.all([
            Department.deleteMany(), Designation.deleteMany(), User.deleteMany(),
            Client.deleteMany(), OEM.deleteMany(), Product.deleteMany(),
            Tender.deleteMany(), FinancialRequest.deleteMany(), BiddingTemplate.deleteMany(),
            StandardProcess.deleteMany()
        ]);
        console.log('Data cleared.');

        // Insert static data
        await Department.insertMany(MOCK_DEPARTMENTS);
        await Designation.insertMany(MOCK_DESIGNATIONS);
        await BiddingTemplate.insertMany(MOCK_BIDDING_TEMPLATES);
        console.log('Seeded Departments, Designations, and Templates.');

        // Insert users one by one to trigger password hashing
        console.log('Seeding users and hashing passwords...');
        // We use a loop with User.create() instead of insertMany() to ensure the pre-save hook for password hashing is triggered.
        for (const userData of MOCK_USERS) {
            await User.create(userData);
        }
        console.log('Seeded Users.');

        // Insert clients, OEMs, Products
        await Client.insertMany(MOCK_CLIENTS);
        await OEM.insertMany(MOCK_OEMS);
        await Product.insertMany(MOCK_PRODUCTS);
        console.log('Seeded Clients, OEMs, and Products.');

        // Insert Tenders (references are by ID string, which is fine)
        await Tender.insertMany(MOCK_TENDERS);
        console.log('Seeded Tenders.');

        // Insert Financial Requests
        await FinancialRequest.insertMany(MOCK_FINANCIAL_REQUESTS);
        console.log('Seeded Financial Requests.');

        console.log('Database seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
