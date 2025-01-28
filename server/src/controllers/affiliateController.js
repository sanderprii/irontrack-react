const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ✅ Veendu, et module.exports on õigesti seadistatud
const getMyAffiliate = async (req, res) => {
    try {
        const userId = req.user?.id; // JWT-st saadud kasutaja ID


        if (!userId) {
            console.error("❌ Missing userId in JWT");
            return res.status(401).json({ error: "Unauthorized: Missing userId" });
        }



        const affiliate = await prisma.affiliate.findFirst({
            where: { ownerId: userId },
            include: {
                trainers: {
                    include: {
                        trainer: true,
                    },
                },
            },
        });

        if (!affiliate) {
            console.log("❌ No affiliate found for this user");
            return res.json({ noAffiliate: true });
        }

        const trainers = affiliate.trainers.map((t) => ({
            fullName: t.trainer.fullName || "",
            username: t.trainer.username,
            trainerId: t.trainerId,
        }));


        res.json({ affiliate, trainers });
    } catch (error) {
        console.error("❌ Error loading affiliate:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const searchUsers = async (req, res) => {
    try {
        const query = req.query.q;
        const userId = req.user?.id;

        if (!query || query.trim() === "") {
            return res.status(400).json({ error: "Query parameter is required." });
        }


        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { email: { contains: query} },
                    { fullName: { contains: query} },
                ],
                id: { not: userId },
            },
            select: {
                id: true,
                email: true,
                fullName: true,
            },
            take: 10,
        });


        res.json(users);
    } catch (error) {
        console.error("❌ Error searching users:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const createOrUpdateAffiliate = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id, name, address, trainingType, trainers, email, phone, iban, bank } = req.body;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized: Missing userId" });
        }
const affiliateId = parseInt(id)
        const trainerIds = Array.isArray(trainers)
            ? trainers.map((t) => parseInt(t.trainerId)).filter((id) => !isNaN(id))
            : [];

        if (affiliateId) {
            const existing = await prisma.affiliate.findUnique({
                where: { id: parseInt(affiliateId) },
            });

            if (!existing) {
                console.error("❌ Affiliate not found");
                return res.status(404).json({ error: "Affiliate not found" });
            }

            if (existing.ownerId !== userId) {
                console.error("❌ Unauthorized affiliate update attempt");
                return res.status(403).json({ error: "Not authorized or affiliate not found" });
            }

            // ✅ Uuendame affiliate põhivälju
            await prisma.affiliate.update({
                where: { id: parseInt(affiliateId) },
                data: {
                    name,
                    address,
                    trainingType,
                    email,
                    phone,
                    iban,
                    bankName: bank,
                },
            });

            // ✅ Leiame olemasolevad treenerid andmebaasis
            const existingTrainers = await prisma.affiliateTrainer.findMany({
                where: { affiliateId },
            });

            const existingTrainerIds = existingTrainers.map((t) => t.trainerId);

            // ✅ Leiame uued treenerid, kes tuleb lisada
            const newTrainerIds = trainerIds.filter((id) => !existingTrainerIds.includes(id));

            // ✅ Leiame treenerid, kes tuleb eemaldada
            const removedTrainerIds = existingTrainerIds.filter((id) => !trainerIds.includes(id));




            // ✅ Lisame ainult uued treenerid (väldime `NaN` ID-sid)
            if (newTrainerIds.length > 0) {
                await prisma.affiliateTrainer.createMany({
                    data: newTrainerIds.map((tId) => ({
                        affiliateId,
                        trainerId: tId,
                    })),
                });
            }

            // ✅ Eemaldame ainult treenerid, kes enam ei peaks seal olema
            if (removedTrainerIds.length > 0) {
                await prisma.affiliateTrainer.deleteMany({
                    where: {
                        affiliateId,
                        trainerId: { in: removedTrainerIds },
                    },
                });
            }

            res.json({ message: "Affiliate updated successfully!" });
        } else {
            // ✅ Kui affiliate puudub, loome uue ja lisame treenerid
            const newAffiliate = await prisma.affiliate.create({
                data: {
                    name,
                    address,
                    trainingType,
                    ownerId: userId,
                    email,
                    phone,
                    iban,
                    bankName: bank,
                },
            });

            if (trainerIds.length > 0) {
                await prisma.affiliateTrainer.createMany({
                    data: trainerIds.map((tId) => ({
                        affiliateId: newAffiliate.id,
                        trainerId: tId,
                    })),
                });
            }

            res.status(201).json({ message: "Affiliate created successfully!", affiliate: newAffiliate });
        }
    } catch (error) {
        console.error("❌ Error saving affiliate info:", error);
        res.status(500).json({ error: "Failed to save affiliate info." });
    }
};

// ✅ Kasuta `module.exports`, mitte `exports`
module.exports = { getMyAffiliate, searchUsers, createOrUpdateAffiliate };
