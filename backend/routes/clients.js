const express = require('express');
const router = express.Router();

const {
    getAllClients,
    createClient,
    getClient,
    updateClient,
    deleteClient,
    addInteraction,
    addContact,
    updateContact,
    deleteContact,
} = require('../controllers/clientController');

router.route('/').get(getAllClients).post(createClient);
router.route('/:id').get(getClient).put(updateClient).delete(deleteClient);
router.route('/:id/interactions').post(addInteraction);
router.route('/:id/contacts').post(addContact);
router.route('/:id/contacts/:contactId').put(updateContact).delete(deleteContact);

module.exports = router;
