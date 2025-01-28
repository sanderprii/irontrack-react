const express = require('express');
const router = express.Router();
const recordsController = require('../controllers/recordsController');
const ensureAuthenticatedJWT = require('../middlewares/ensureAuthenticatedJWT');

// GET /api/records?type=...
router.get('/', ensureAuthenticatedJWT, recordsController.getRecords);

// GET /api/records/:name
router.get('/:name', ensureAuthenticatedJWT, recordsController.getRecordsByName);

// POST /api/records
router.post('/', ensureAuthenticatedJWT, recordsController.createRecord);

// DELETE /api/records/:id
router.delete('/:id', ensureAuthenticatedJWT, recordsController.deleteRecord);

module.exports = router;
