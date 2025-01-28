const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

const getTodayWOD = async (req, res) => {
    const { affiliateId, date } = req.query;
    if (!date) return res.status(400).json({ error: "Date is required." });
    const date1 = new Date(date);
        date1.setHours(2, 0, 0, 0);
    try {
        const wod = await prisma.todayWOD.findFirst({
            where: {
                affiliateId: parseInt(affiliateId),
                date: date1 }
        });

        if (!wod) return res.status(404).json({ error: "No WOD found for today." });

        res.json(wod);
    } catch (error) {
        console.error("❌ Error fetching today's WOD:", error);
        res.status(500).json({ error: "Failed to fetch today's WOD." });
    }
};

// ✅ Fetch today's WOD
const getWeekWODs = async (req, res) => {
    const { affiliateId } = req.query;

    if (!affiliateId) {
        return res.status(400).json({ error: "Affiliate ID is required." });
    }
const startDate = new Date(req.query.startDate);
    try {
        // ✅ Leia nädala algus ja lõpp
        const startOfWeek = new Date(startDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        // ✅ Tõmba kõik WODid selle nädala jaoks
        const weekWODs = await prisma.todayWOD.findMany({
            where: {
                affiliateId: parseInt(affiliateId),
                date: {
                    gte: startOfWeek,
                    lte: endOfWeek
                }
            },
            orderBy: { date: "asc" }
        });

        return res.json(weekWODs);
    } catch (error) {
        console.error("❌ Error fetching week WODs:", error);
        res.status(500).json({ error: "Failed to fetch week WODs." });
    }
};

// ✅ Create or Update Today's WOD
const saveTodayWOD = async (req, res) => {
    const { affiliateId, wodName, wodType, description, date } = req.body; // ✅ Ainult ühe päeva andmed

    if (!affiliateId) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    try {
        const existingWOD = await prisma.todayWOD.findFirst({
            where: { affiliateId: parseInt(affiliateId), date: new Date(date) }
        });

        if (wodName !== "") {
            const isDefaultWOD = await prisma.defaultWOD.findFirst({
                where: { name: wodName }
            } );
            if (!isDefaultWOD) {
                await prisma.defaultWOD.create({
                    data: {
                        name: wodName,
                        type: wodType,
                        description
                    }
                });
            }
        }

        if (existingWOD) {
            // ✅ Uuenda, kui see päev on juba olemas
            await prisma.todayWOD.update({
                where: { id: existingWOD.id },
                data: { wodName, type: wodType, description }
            });
            return res.json({ message: "WOD updated successfully." });
        } else {
            // ✅ Lisa uus WOD, kui pole olemas
            await prisma.todayWOD.create({
                data: {
                    affiliateId: parseInt(affiliateId),
                    wodName,
                    type: wodType,
                    description,
                    date: new Date(date)
                }
            });
            return res.json({ message: "WOD added successfully." });
        }


    } catch (error) {
        console.error("❌ Error saving today's WOD:", error);
        res.status(500).json({ error: "Failed to save WOD." });
    }
};


// ✅ Apply WOD to Today's Trainings
const applyWODToTrainings = async (req, res) => {
    const date = req.body.date;
    const affiliateId = req.body.affiliateId;
    if (!date) return res.status(400).json({error: "Date is required."});
console.log('date',date)


    const affiliateIds = parseInt(affiliateId)
    try {
        const wod = await prisma.todayWOD.findFirst({where: {date: date, affiliateId: affiliateIds}});

        if (!wod) return res.status(404).json({error: "No WOD found for today."});

        const endDate = new Date(new Date(date).setDate(new Date(date).getDate() + 1));
console.log('endDate',endDate)
        // Apply WOD to all classes with `trainingType: "WOD"`
        await prisma.classSchedule.updateMany({
            where: {
                time: {
                    gte: date,
                    lt: endDate
                },
                trainingType: "WOD",
                affiliateId: affiliateIds
            },
            data: {
                wodName: wod.wodName,
                wodType: wod.type,
                description: wod.description
            }
        });

        res.json({message: "WOD applied to all today's trainings!"});
    } catch (error) {
        console.error("❌ Error applying WOD to trainings:", error);
        res.status(500).json({error: "Failed to apply WOD to trainings."});
    }
};


module.exports = { getTodayWOD, getWeekWODs, saveTodayWOD, applyWODToTrainings };
