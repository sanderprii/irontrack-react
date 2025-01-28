const express = require("express");
const ensureAuthenticated = require("../middlewares/ensureAuthenticatedJWT");
const { getTodayWOD,
    getWeekWODs,
    saveTodayWOD,
    applyWODToTrainings,


} = require("../controllers/wodController");
const { searchDefaultWODs } = require("../controllers/defaultWOD");

const router = express.Router();

router.get("/get-today-wod", ensureAuthenticated, getTodayWOD);
router.get("/get-week-wods", ensureAuthenticated, getWeekWODs);
router.post("/today-wod", ensureAuthenticated, saveTodayWOD);
router.post("/apply-wod", ensureAuthenticated, applyWODToTrainings);
router.get("/search-default-wods", ensureAuthenticated, searchDefaultWODs);


module.exports = router;
