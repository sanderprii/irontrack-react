const express = require("express");
const router = express.Router();
const ensureAuthenticated = require("../middlewares/ensureAuthenticatedJWT");

const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();

// 🔹 GET: Kõik liikmed, kes kuuluvad omaniku või treeneri alla
router.get("/members", ensureAuthenticated, async (req, res) => {
    try {
        let affiliateIds = req.query.affiliateId ? [parseInt(req.query.affiliateId, 10)] : [];



        const members = await prisma.members.findMany({
            where: { affiliateId: { in: affiliateIds } },
            include: { user: true },
        });

        res.json(members);
    } catch (error) {
        console.error("Error fetching members:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 🔹 GET: Konkreetse liikme info (krediit, plaanid jne)
router.get("/member-info", ensureAuthenticated, async (req, res) => {
    const userId = parseInt(req.query.userId, 10);

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) return res.status(404).json({ error: "User not found" });

        let affiliateIds = [];
        if (req.session.currentRole === "owner") {
            const affiliate = await prisma.affiliate.findFirst({
                where: { ownerId: req.session.userId },
            });
            if (affiliate) affiliateIds.push(affiliate.id);
        } else if (req.session.currentRole === "trainer") {
            const relations = await prisma.affiliateTrainer.findMany({
                where: { trainerId: req.session.userId },
            });
            affiliateIds = relations.map((r) => r.affiliateId);
        }

        const userPlans = await prisma.userPlan.findMany({
            where: {
                userId,
                affiliateId: { in: affiliateIds },
            },
            orderBy: { id: "asc" },
        });

        res.json({
            id: user.id,
            fullName: user.fullName || user.username,
            email: user.email,
            phone: user.phone,
            credit: user.credit || 0,
            logo: user.logo,
            isMember: userPlans.length > 0,
            plans: userPlans.map((plan) => ({
                planName: plan.planName,
                endDate: plan.endDate,
                userPlanId: plan.id,
            })),
        });
    } catch (error) {
        console.error("Error fetching member info:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});



// 🔹 POST: Lisa liikmele krediiti
router.post("/add-credit", ensureAuthenticated, async (req, res) => {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
        return res.status(400).json({ error: "Missing user ID or amount" });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId, 10) },
        });

        if (!user) return res.status(404).json({ error: "User not found" });

        await prisma.user.update({
            where: { id: parseInt(userId, 10) },
            data: { credit: user.credit + parseFloat(amount) },
        });

        res.json({ message: "Credit updated successfully" });
    } catch (error) {
        console.error("Error adding credit:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// 🔹 PATCH: Uuenda liikme plaani lõppkuupäeva
router.patch("/userplan-enddate", ensureAuthenticated,  async (req, res) => {
    const { userPlanId, endDate } = req.body;

    if (!userPlanId || !endDate) {
        return res.status(400).json({ error: "Missing fields" });
    }

    try {
        await prisma.userPlan.update({
            where: { id: parseInt(userPlanId, 10) },
            data: { endDate: new Date(endDate) },
        });

        res.json({ message: "Plan endDate updated successfully" });
    } catch (error) {
        console.error("Error updating plan endDate:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Add Member
router.post("/add-member", ensureAuthenticated, async (req, res) => {
    const { userId, affiliateId } = req.body;
    try {
        await prisma.members.create({ data: { userId: parseInt(userId), affiliateId: parseInt(affiliateId) } });
        res.json({ message: "Member added successfully" });
    } catch (error) {
        console.error("Error adding member:", error);
        res.status(500).json({ error: "Failed to add member." });
    }
});

router.get("/api/owner-affiliate", ensureAuthenticated, async (req, res) => {
    try {
        const affiliate = await prisma.affiliate.findFirst({ where: { ownerId: req.user?.id } });
        res.json({ affiliateId: affiliate.id });
    } catch (error) {
        console.error("Error fetching owner affiliate ID:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
