const express = require('express');
const router = express.Router();
const { searchDefaultWODs } = require('../controllers/defaultWOD');

// API Endpoint Default WOD-de otsimiseks
router.get('/search-default-wods', searchDefaultWODs);

module.exports = router;
