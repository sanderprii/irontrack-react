const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingControllers');
const ensureAuthenticated = require('../middlewares/ensureAuthenticatedJWT');

// POST /api/training
router.post('/', ensureAuthenticated, trainingController.createTraining);
router.get('/', ensureAuthenticated, trainingController.getTrainings);

// PUT /api/training/:id
router.put('/:id', ensureAuthenticated, trainingController.updateTraining);

// DELETE /api/training/:id
router.delete('/:id', ensureAuthenticated, trainingController.deleteTraining);

module.exports = router;
