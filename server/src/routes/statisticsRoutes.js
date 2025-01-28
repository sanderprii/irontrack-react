const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const ensureAuthenticatedJWT = require('../middlewares/ensureAuthenticatedJWT');

// GET /api/statistics
router.get('/', ensureAuthenticatedJWT, statisticsController.getStatistics);

// POST /api/statistics/monthly-goal
router.post('/monthly-goal', ensureAuthenticatedJWT, statisticsController.updateMonthlyGoal);

module.exports = router;
