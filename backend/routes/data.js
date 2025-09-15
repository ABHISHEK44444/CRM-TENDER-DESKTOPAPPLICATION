const express = require('express');
const router = express.Router();
const { getDepartments, getDesignations, getTemplates, saveTemplate, deleteTemplate } = require('../controllers/dataController');

router.get('/departments', getDepartments);
router.get('/designations', getDesignations);
router.get('/templates', getTemplates);
router.post('/templates', saveTemplate);
router.put('/templates/:id', saveTemplate);
router.delete('/templates/:id', deleteTemplate);

module.exports = router;
