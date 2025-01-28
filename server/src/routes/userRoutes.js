const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const ensureAuthenticatedJWT = require('../middlewares/ensureAuthenticatedJWT');

// GET /api/user-data -> enamasti kasutad GET /api/user, aga võib hoida
router.get('/user-data', ensureAuthenticatedJWT, userController.getUserData);

// user visit history
router.get('/user-visit-history', ensureAuthenticatedJWT, userController.getVisitHistory);

// user purchase history
router.get('/user-purchase-history', ensureAuthenticatedJWT, userController.getPurchaseHistory);

// change password
router.post('/change-password', ensureAuthenticatedJWT, userController.changePassword);

// post /profile -> "editProfile"?
router.post('/profile', ensureAuthenticatedJWT, userController.editProfile);

// get /api/user
router.get('/', ensureAuthenticatedJWT, userController.getUser);

// put /api/user
router.put('/', ensureAuthenticatedJWT, userController.updateUserData);

// user-plans
router.get('/user-plans', ensureAuthenticatedJWT, userController.getUserPlansByAffiliate);

module.exports = router;
