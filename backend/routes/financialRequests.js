const express = require('express');
const router = express.Router();

const {
    getAllRequests,
    createRequest,
    getRequest,
    updateRequest,
    deleteRequest
} = require('../controllers/financialRequestController');

router.route('/').get(getAllRequests).post(createRequest);
router.route('/:id').get(getRequest).put(updateRequest).delete(deleteRequest);

module.exports = router;
