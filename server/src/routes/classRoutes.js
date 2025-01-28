const express = require("express");
const router = express.Router();
const classController = require("../controllers/classController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticatedJWT");

const { checkClassScore, addClassScore, updateClassScore } = require("../controllers/classController");

// API endpointid
router.get("/class-info", ensureAuthenticated, classController.getClassInfo);
router.get("/classes", ensureAuthenticated, classController.getClasses);
router.post("/classes", ensureAuthenticated, classController.createClass);
router.put("/classes/:id", ensureAuthenticated, classController.updateClass);
router.delete("/classes/:id", ensureAuthenticated, classController.deleteClass);
router.get("/class-attendees", ensureAuthenticated, classController.getClassAttendees);
router.post("/classes/register", ensureAuthenticated, classController.registerForClass);
router.post("/classes/cancel", ensureAuthenticated, classController.cancelRegistration);
router.get("/class/check-enrollment", ensureAuthenticated, classController.checkUserEnrollment);
router.get("/attendees/:classId", ensureAuthenticated, classController.getClassAttendeesCount);

router.patch("/class-attendees/check-in", ensureAuthenticated, classController.checkInAttendee);
router.delete("/class-attendees", ensureAuthenticated, classController.deleteAttendee);

router.get("/classes/leaderboard/check", ensureAuthenticated, checkClassScore);
router.post("/classes/leaderboard/add", ensureAuthenticated, addClassScore);
router.put("/classes/leaderboard/update", ensureAuthenticated, updateClassScore);


module.exports = router;
