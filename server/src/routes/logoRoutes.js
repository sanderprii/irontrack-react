// routes/logoRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // kasutame mälu salvestust
const { uploadLogo, uploadProfilePicture } = require('../controllers/logoController');

router.post('/upload-logo', upload.single('logo'), uploadLogo);
router.post('/upload-profile-picture', upload.single('logo'), uploadProfilePicture);

module.exports = router;
