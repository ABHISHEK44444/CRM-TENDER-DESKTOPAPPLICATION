const Client = require('../models/client');

const getAllClients = async (req, res) => {
    try {
        // Select only the fields needed for the list view to reduce payload size
        const clients = await Client.find({})
            .select('id name category status contacts potentialValue')
            .sort({ name: 1 });
        res.status(200).json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createClient = async (req, res) => {
    try {
        const newClientData = { ...req.body, id: `cli${Date.now()}` };
        const client = await Client.create(newClientData);
        res.status(201).json(client);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getClient = async (req, res) => {
    try {
        const client = await Client.findOne({ id: req.params.id });
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(200).json(client);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateClient = async (req, res) => {
    try {
        let updateData = { ...req.body };
        if (req.query.silent !== 'true') {
            const historyEntry = {
                user: 'System', // Placeholder
                action: 'Updated Client Details',
                timestamp: new Date().toISOString(),
            };
            updateData.$push = { history: historyEntry };
        }
        
        const client = await Client.findOneAndUpdate({ id: req.params.id }, updateData, { new: true, runValidators: true });
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(200).json(client);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteClient = async (req, res) => {
    try {
        const client = await Client.findOneAndDelete({ id: req.params.id });
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(200).json({ message: 'Client deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addInteraction = async (req, res) => {
    try {
        const client = await Client.findOne({ id: req.params.id });
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        const newInteraction = { ...req.body, id: `int${Date.now()}`, timestamp: new Date().toISOString() };
        client.interactions.push(newInteraction);
        await client.save();
        res.status(200).json(client);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const addContact = async (req, res) => {
    try {
        const client = await Client.findOne({ id: req.params.id });
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        const newContact = { ...req.body, id: `cont${Date.now()}`};
        
        if (newContact.isPrimary) {
            client.contacts.forEach(c => c.isPrimary = false);
        }
        client.contacts.push(newContact);
        await client.save();
        res.status(200).json(client);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateContact = async (req, res) => {
    try {
        const client = await Client.findOne({ id: req.params.id });
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        
        if (req.body.isPrimary) {
             client.contacts.forEach(c => c.isPrimary = false);
        }
        
        const contactIndex = client.contacts.findIndex(c => c.id === req.params.contactId);
        if (contactIndex === -1) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        client.contacts[contactIndex] = { ...client.contacts[contactIndex], ...req.body };
        await client.save();
        res.status(200).json(client);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteContact = async (req, res) => {
     try {
        const client = await Client.findOne({ id: req.params.id });
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        client.contacts = client.contacts.filter(c => c.id !== req.params.contactId);
        await client.save();
        res.status(200).json(client);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getAllClients,
    createClient,
    getClient,
    updateClient,
    deleteClient,
    addInteraction,
    addContact,
    updateContact,
    deleteContact
};
