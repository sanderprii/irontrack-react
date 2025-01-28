const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

// ✅ GET: Kõik plaanid
const getPlans = async (req, res) => {
    const ownerId = parseInt(req.user?.id);
    try {
        const whereClause = ownerId ? {ownerId} : {};

        // Omanik näeb ainult oma plaane
        if (req.user.role === 'owner') {
            whereClause.ownerId = req.user.id;
        }

        const plans = await prisma.plan.findMany({
            where: whereClause,
            orderBy: {id: 'asc'}
        });

        res.json(plans);
    } catch (error) {
        console.error("Error fetching plans:", error);
        res.status(500).json({error: "Failed to fetch plans."});
    }
};

// ✅ POST: Uus plaan
const createPlan = async (req, res) => {
    const ownerId = parseInt(req.user?.id);
    const {name, validityDays, price, additionalData, sessions} = req.body;

    try {
        const newPlan = await prisma.plan.create({
            data: {
                name,
                validityDays: parseInt(validityDays),
                price: parseFloat(price),
                additionalData,
                sessions: parseInt(sessions),
                ownerId
            }
        });

        res.status(201).json({message: "Plan created successfully!", plan: newPlan});
    } catch (error) {
        console.error("Error creating plan:", error);
        res.status(500).json({error: "Failed to create plan."});
    }
};

const updatePlan = async (req, res) => {
    const ownerId = parseInt(req.user?.id);
    const planId = parseInt(req.params.id);
    const {name, validityDays, price, additionalData, sessions} = req.body;

    try {
        const existingPlan = await prisma.plan.findUnique({where: {id: planId}});

        if (!existingPlan || existingPlan.ownerId !== ownerId) {
            return res.status(403).json({error: "Not authorized to update this plan."});
        }

        const updatedPlan = await prisma.plan.update({
            where: {id: planId},
            data: {
                name,
                validityDays: parseInt(validityDays),
                price: parseFloat(price),
                additionalData,
                sessions: parseInt(sessions)
            }
        });

        res.status(200).json({message: "Plan updated successfully!", plan: updatedPlan});
    } catch (error) {
        console.error("Error updating plan:", error);
        res.status(500).json({error: "Failed to update plan."});
    }
};

// ✅ DELETE: Plaani kustutamine
const deletePlan = async (req, res) => {
    const ownerId = parseInt(req.user?.id);
    const planId = parseInt(req.params.id);

    try {
        const existingPlan = await prisma.plan.findUnique({where: {id: planId}});

        if (!existingPlan || existingPlan.ownerId !== ownerId) {
            return res.status(403).json({error: "Not authorized to delete this plan."});
        }

        await prisma.plan.delete({where: {id: planId}});

        res.status(200).json({message: "Plan deleted successfully!"});
    } catch (error) {
        console.error("Error deleting plan:", error);
        res.status(500).json({error: "Failed to delete plan."});
    }
};

const buyPlan = async (req, res) => {
    const planData = req.body.planData;
    const appliedCredit = parseInt(req.body.appliedCredit);
    const affiliateId = parseInt(req.params.affiliateId);
    const userId = parseInt(req.user?.id);

    try {
        // Kontrollid, mis ei muuda andmebaasi, võid hoida eraldi
        const plan = await prisma.plan.findUnique({ where: { id: parseInt(planData.id) } });
        if (!plan) {
            return res.status(404).json({ error: "Plan not found." });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { members: true }
        });
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        const affiliate = await prisma.affiliate.findUnique({ where: { id: affiliateId } });
        if (!affiliate) {
            return res.status(404).json({ error: "Affiliate not found." });
        }
        const invoicenumberDateandTime = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);

        // Transaktsioon, mis sisaldab kõiki andmebaasi kirjutavaid operatsioone
        await prisma.$transaction(async (prisma) => {
            // Liige loomine, kui puudub
            if (!user.members[0]) {
                await prisma.members.create({
                    data: {
                        userId: userId,
                        affiliateId: affiliateId,
                    }
                });
            }

            const getMember = await prisma.members.findFirst({
                where: { userId: userId, affiliateId: affiliateId }
            });

            // Krediidi kasutamine ja krediidi tehingu loomine, kui rakendatav krediit on suurem kui 0
            if (appliedCredit > 0) {
                await prisma.credit.update({
                    where: {
                        userId_affiliateId: {
                            userId: userId,
                            affiliateId: affiliateId,
                        },
                    },
                    data: { credit: { decrement: appliedCredit } }
                });

                const credit = await prisma.credit.findUnique({
                    where: { userId_affiliateId: { userId: userId, affiliateId: affiliateId } },
                    select: { id: true }
                });

                await prisma.creditTransaction.create({
                    data: {
                        userId: userId,
                        affiliateId: affiliateId,
                        creditAmount: appliedCredit,
                        decrease: true,
                        creditId: credit.id,
                        paymentRef: invoicenumberDateandTime,
                        description: `Plan purchase: ${planData.name}, by: ${user.email}, from: ${affiliate.name}`,
                    }
                });
            }

            // Transaktsiooni loomine
            await prisma.transactions.create({
                data: {
                    userId: userId,
                    amount: planData.price,
                    invoiceNumber: invoicenumberDateandTime,
                    description: `Plan purchase: ${planData.name}, by: ${user.email}, from: ${affiliate.name}`,
                    type: 'debit',
                    affiliateId: affiliateId,
                    planId: planData.id,
                    memberId: parseInt(getMember.id),
                    status: "success"
                }
            });

            // Kasutaja plaani lisamine
            await prisma.userPlan.create({
                data: {
                    userId: userId,
                    affiliateId: affiliateId,
                    planId: planData.id,
                    purchasedAt: new Date(),
                    endDate: new Date(new Date().getTime() + planData.validityDays * 24 * 60 * 60 * 1000),
                    price: planData.price,
                    validityDays: planData.validityDays,
                    sessionsLeft: planData.sessions,
                    planName: planData.name,
                }
            });

            // Kasutaja uue affiliate'i lisamine
            await prisma.user.update({
                where: { id: userId },
                data: { homeAffiliate: affiliateId }
            });
        });

        res.status(201).json({ message: "Transaction successful!" });
    } catch (error) {
        console.error("Error buying plan:", error);
        res.status(500).json({ error: "Failed to buy plan." });
    }
};


const getUserCredit = async (req, res) => {
    // Eeldame, et kasutaja autentimine on juba tehtud ja req.user on olemas
    const userId = parseInt(req.user?.id, 10);
    // Võtame affiliateId URL parameetrist (näiteks /credit/123)
    const affiliateId = parseInt(req.params.affiliateId, 10);

    try {
        const userCredit = await prisma.credit.findUnique({
            where: {userId_affiliateId: {userId, affiliateId}},
            select: {credit: true},
        });

        res.json(userCredit);
    } catch (error) {
        console.error("Error fetching user credit:", error);
        res.status(500).json({error: "Failed to fetch user credit."});
    }
};


module.exports = {getPlans, createPlan, updatePlan, deletePlan, buyPlan, getUserCredit};