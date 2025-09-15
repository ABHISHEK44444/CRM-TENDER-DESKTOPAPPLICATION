const express = require('express');
const router = express.Router();
const {
    getAllTenders,
    createTender,
    getTender,
    updateTender,
    deleteTender,
    importTender,
    respondToAssignment
} = require('../controllers/tenderController');

router.route('/').get(getAllTenders).post(createTender);
router.route('/import').post(importTender);
router.route('/:id').get(getTender).put(updateTender).delete(deleteTender);
router.route('/:id/respond').post(respondToAssignment);


module.exports = router;
