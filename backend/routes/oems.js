const express = require('express');
const router = express.Router();

const {
    getAllOems,
    createOem,
    getOem,
    updateOem,
    deleteOem
} = require('../controllers/oemController');

router.route('/').get(getAllOems).post(createOem);
router.route('/:id').get(getOem).put(updateOem).delete(deleteOem);

module.exports = router;
