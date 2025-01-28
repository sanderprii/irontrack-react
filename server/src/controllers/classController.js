const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();

// Klasside info saamine
const getClassInfo = async (req, res) => {
    const classId = parseInt(req.query.classId);
    if (!classId) return res.status(400).json({error: "Class ID required."});

    try {
        const cls = await prisma.classSchedule.findUnique({
            where: {id: classId},
            select: {memberCapacity: true}
        });

        if (!cls) {
            return res.status(404).json({error: "Class not found."});
        }

        // Leia registreeritud kasutajate arv
        const count = await prisma.classAttendee.count({where: {classId}});

        res.json({memberCapacity: cls.memberCapacity, enrolledCount: count});
    } catch (error) {
        console.error("Error fetching class info:", error);
        res.status(500).json({error: "Internal server error."});
    }
};

// Klasside nimekirja pärimine
const getClasses = async (req, res) => {

    let { affiliateId, start, end } = req.query;
    // Kontrolli ja teisenda kuupäevad õigesse formaati
    let startDate = new Date(start);
    let endDate = new Date(end);

    // Kui start või end on kehtetu, määrame vaikimisi käesoleva nädala alguse ja lõpu
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.warn("⚠️ Kehtetu kuupäev, määrame vaikimisi väärtused.");
        startDate = new Date(); // Tänane kuupäev
        startDate.setDate(startDate.getDate() - startDate.getDay() + 1); // Esmaspäev
        startDate.setHours(0, 0, 0, 0); // Alustame päeva algusega

        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6); // Pühapäev
        endDate.setHours(23, 59, 59, 999); // Päeva lõpp
    }



    try {
        const classes = await prisma.classSchedule.findMany({
            where: {
                affiliateId: parseInt(affiliateId),
                time: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: { time: "asc" }
        });

        res.json(classes);
    } catch (error) {
        console.error("❌ Error fetching classes:", error);
        res.status(500).json({ error: "Failed to fetch classes." });
    }
};

// Uue klassi loomine
const createClass = async (req, res) => {
    try {
        const { affiliateId, trainingType, trainingName, time, duration, trainer, memberCapacity, location, repeatWeekly, wodName, wodType } = req.body;
const owner = parseInt(req.user?.id);


        // Loome Prisma jaoks sobiva DateTime formaadi (YYYY-MM-DDTHH:MM:SS.000Z)
        const classTime = new Date(time.replace("Z", ""));



        // Kontrollime, kas loodud kuupäev on kehtiv


        const newClass = await prisma.classSchedule.create({
            data: {
                trainingType,
                trainingName,
                time: classTime, // ✅ Õige DateTime väärtus Prisma jaoks
                duration: parseInt(duration),
                trainer,
                memberCapacity: parseInt(memberCapacity),
                location,
                repeatWeekly,
                wodName,
                wodType,
                ownerId: owner,
                affiliateId: parseInt(affiliateId)
            }
        });

        // if repeatWeekly is true, create new classes for the next 52 weeks. seriedId is the id of the first class in the series
        if (repeatWeekly) {
            const seriesId = newClass.id;
            const series = [];
            for (let i = 0; i < 52; i++) {
                series.push({
                    trainingType,
                    trainingName,
                    time: new Date(classTime.setDate(classTime.getDate() + 7)), // ✅ Õige DateTime väärtus Prisma jaoks
                    duration: parseInt(duration),
                    trainer,
                    memberCapacity: parseInt(memberCapacity),
                    location,
                    repeatWeekly,


                    ownerId: owner,
                    affiliateId: parseInt(affiliateId),
                    seriesId
                });
            }

            await prisma.classSchedule.createMany({data: series});
        }


        res.status(201).json({ message: "Class created successfully!", class: newClass });
    } catch (error) {
        console.error("❌ Error creating class:", error);
        res.status(500).json({ error: "Failed to create class." });
    }
};


// Klasside uuendamine
const updateClass = async (req, res) => {
    const classId = parseInt(req.params.id);
    const { trainingType, trainingName, time, duration, trainer, memberCapacity, location, repeatWeekly, wodName, wodType } = req.body;
    const data = req.body;


    // time võib tulla õiges formaadis kui ka dateTTime formaadis. Kontrollime ja teisendame õigesse formaati
    let classTime = new Date(time);
    if (isNaN(classTime.getTime())) {
        // Kui kuupäev on vigane, proovime teisendada
        classTime = new Date(`${time}:00.000Z`);
    } else {
        // Kui kuupäev on õige, siis teisendame UTC formaati
        classTime = new Date(classTime.toISOString());
    }


    try {
        const data = req.body;
        data.duration = parseInt(data.duration);
        const updatedClass = await prisma.classSchedule.update({
            where: {id: classId},
            data: {
                trainingType,
                trainingName,
                time: classTime, // ✅ Õige DateTime väärtus Prisma jaoks
                duration: parseInt(duration),
                trainer,
                memberCapacity: parseInt(memberCapacity),
                location,
                repeatWeekly,
                wodName,
                wodType
            }
        });

        await prisma.classSchedule.deleteMany({
            where: {
                seriesId: data.seriesId,
                id: { gt: data.id }
            }
        });


        res.status(200).json({message: "Class updated successfully!", class: updatedClass});
    } catch (error) {
        console.error("Error updating class:", error);
        res.status(500).json({error: "Failed to update class."});
    }
};

// Klasside kustutamine
const deleteClass = async (req, res) => {
    const classId = parseInt(req.params.id);

    try {
        await prisma.classSchedule.delete({where: {id: classId}});
        res.status(200).json({message: "Class deleted successfully!"});
    } catch (error) {
        console.error("Error deleting class:", error);
        res.status(500).json({error: "Failed to delete class."});
    }
};

// Klasside osalejate pärimine
const getClassAttendees = async (req, res) => {
    const classId = parseInt(req.query.classId);
    if (!classId) return res.status(400).json({ error: "Class ID required." });

    try {
        const attendees = await prisma.classAttendee.findMany({
            where: { classId },
            include: { user: { select: { id: true, fullName: true } } }
        });

        res.json(attendees.map(att => ({
            userId: att.user.id,
            fullName: att.user.fullName,
            checkIn: att.checkIn // ✅ Lisatud checkIn staatus
        })));
    } catch (error) {
        console.error("❌ Error fetching attendees:", error);
        res.status(500).json({ error: "Failed to fetch attendees." });
    }
};

const checkInAttendee = async (req, res) => {
    const { classId, userId } = req.body;
    if (!classId || !userId) return res.status(400).json({ error: "Class ID and User ID required." });

    try {
        await prisma.classAttendee.updateMany({
            where: { classId, userId },
            data: { checkIn: true }
        });

        res.json({ message: "Check-in successful!" });
    } catch (error) {
        console.error("❌ Error checking in attendee:", error);
        res.status(500).json({ error: "Failed to check in attendee." });
    }
};

const deleteAttendee = async (req, res) => {
    const { classId, userId } = req.body;
    if (!classId || !userId) return res.status(400).json({ error: "Class ID and User ID required." });

    try {
        await prisma.classAttendee.deleteMany({
            where: { classId, userId }
        });

        res.json({ message: "Attendee removed from class." });
    } catch (error) {
        console.error("❌ Error deleting attendee:", error);
        res.status(500).json({ error: "Failed to remove attendee." });
    }
};


// classes anttendees count
const getClassAttendeesCount = async (req, res) => {
    const classId = parseInt(req.params.classId);
    if (!classId) return res.status(400).json({error: "Class ID required"});
    try {
        const count = await prisma.classAttendee.count({where: {classId}});
        res.json({count});
    } catch (error) {
        console.error("Error fetching attendees count:", error);
        res.status(500).json({error: "Failed to fetch attendees count"});
    }
};



// ✅ Kasutaja registreerumine klassi
const registerForClass = async (req, res) => {
    const { classId, planId } = req.body;
    const userId = req.user?.id;

    try {
        const plan = await prisma.userPlan.findUnique({
            where: { id: planId },
        });

        if (!plan || plan.sessionsLeft <= 0) {
            return res.status(400).json({ error: "Invalid or expired plan" });
        }


        await prisma.classAttendee.create({
            data: {
                userId,
                classId,
                checkIn: false,
                userPlanId: planId
            },
        });

        await prisma.userPlan.update({
            where: { id: planId },
            data: { sessionsLeft: plan.sessionsLeft - 1 },
        });

        res.status(200).json({ message: "Successfully registered!" });
    } catch (error) {
        console.error("❌ Error registering for class:", error);
        res.status(500).json({ error: "Failed to register for class." });
    }
};

// ✅ Kasutaja registreeringu tühistamine
const cancelRegistration = async (req, res) => {
    const { classId } = req.body;
    const userId = req.user.id;

    try {

        const registration = await prisma.classAttendee.findFirst({
            where: { userId: parseInt(userId), classId: parseInt(classId) },

        });
console.log(registration);

        await prisma.classAttendee.delete({
            where: { id: registration.id },
        });

        // Tagasta sessioon kasutajale tagasi
        await prisma.userPlan.update({
            where: { id: registration.userPlanId },
            data: { sessionsLeft: { increment: 1 } },
        });

        res.status(200).json({ message: "Registration cancelled successfully!" });
    } catch (error) {
        console.error("❌ Error canceling registration:", error);
        res.status(500).json({ error: "Failed to cancel registration." });
    }
};

// ✅ Kontrolli, kas kasutaja on klassis registreeritud
const checkUserEnrollment = async (req, res) => {
    const classId = parseInt(req.query.classId);
    const userId = parseInt(req.user.id);
console.log(classId);
console.log(userId);
    try {
        const enrollment = await prisma.classAttendee.findFirst({
            where: { userId, classId },
        });

        res.json({ enrolled: !!enrollment });
    } catch (error) {
        console.error("❌ Error checking enrollment:", error);
        res.status(500).json({ error: "Failed to check enrollment." });
    }
};

const checkClassScore = async (req, res) => {
    try {
        const { classId } = req.query;
        const userId = req.user.id;

        const existing = await prisma.classLeaderboard.findFirst({
            where: { classId: parseInt(classId), userId },
        });

        if (!existing) {
            return res.json({ hasScore: false });
        }

        res.json({
            hasScore: true,
            scoreType: existing.scoreType,
            score: existing.score
        });
    } catch (error) {
        console.error("Error checking class score:", error);
        res.status(500).json({ error: "Failed to check class score" });
    }
};

const addClassScore = async (req, res) => {
    try {
        const { classId, scoreType, score } = req.body;
        const userId = req.user.id;

        // Kontrolli, kas see rida juba eksisteerib
        const existing = await prisma.classLeaderboard.findFirst({
            where: { classId, userId },
        });
        if (existing) {
            return res
                .status(400)
                .json({ error: "Score already exists. Please update instead." });
        }

        // Loo uus kirje
        await prisma.classLeaderboard.create({
            data: {
                classId,
                userId,
                scoreType,
                score
            },
        });

        res.status(200).json({ message: "Score added successfully." });
    } catch (error) {
        console.error("Error adding class score:", error);
        res.status(500).json({ error: "Failed to add class score" });
    }
};

const updateClassScore = async (req, res) => {
    try {
        const { classId, scoreType, score } = req.body;
        const userId = req.user.id;

        // Kontrolli, et kirje on olemas
        const existing = await prisma.classLeaderboard.findFirst({
            where: { classId, userId },
        });
        if (!existing) {
            return res
                .status(400)
                .json({ error: "No existing score found for this class." });
        }

        // Uuenda
        await prisma.classLeaderboard.update({
            where: { id: existing.id },
            data: {
                scoreType,
                score
            },
        });

        res.status(200).json({ message: "Score updated successfully." });
    } catch (error) {
        console.error("Error updating class score:", error);
        res.status(500).json({ error: "Failed to update class score" });
    }
};

module.exports = {getClassInfo, getClasses, createClass, updateClass, deleteClass,
    getClassAttendees, registerForClass, cancelRegistration, checkUserEnrollment,
    getClassAttendeesCount, checkInAttendee, deleteAttendee, addClassScore, updateClassScore, checkClassScore,
    };