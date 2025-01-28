const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const ensureAuthenticated = require("../middlewares/ensureAuthenticatedJWT");


// 📌 GET: Kõik tellimused
router.get("/orders", ensureAuthenticated, async (req, res) => {
    try {

        const affiliateIds = parseInt(req.query.affiliateId);


        const orders = await prisma.userPlan.findMany({
            where: { affiliateId: { in: Array.isArray(affiliateIds) ? affiliateIds : [affiliateIds] } },
            include: { user: { select: { fullName: true, email: true } } },
            orderBy: { purchasedAt: "desc" }
        });

        res.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 📌 GET: Ühe kasutaja tellimused
router.get("/orders/:userId", ensureAuthenticated, async (req, res) => {
    const userId = parseInt(req.params.userId);

    try {
        const orders = await prisma.userPlan.findMany({
            where: { userId },
            include: { user: { select: { fullName: true, email: true } } },
            orderBy: { purchasedAt: "desc" }
        });

        res.json(orders);
    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 📌 Endpoint, et saada tulu ja plaanide müügi andmed määratud perioodi jooksul
router.get('/finance', ensureAuthenticated, async (req, res) => {
    try {
        const { startDate, endDate, affiliateId } = req.query;

        // 📌 ✅ Vaikimisi kuupäevad
        const currentYear = new Date().getFullYear();
        const defaultStart = new Date(`${currentYear}-01-01`);
        const defaultEnd = new Date(`${currentYear}-12-31`);

        const start = startDate ? new Date(startDate) : defaultStart;
        const end = endDate ? new Date(endDate) : defaultEnd;

        // 📌 ✅ Leia kasutaja affiliateId(d)
        let affiliateIds = parseInt(affiliateId)



        if (affiliateIds.length === 0) {
            return res.status(403).json({ error: "No affiliate access" });
        }

        // 📌 ✅ Leia tulu (revenue)
        const revenue = await prisma.userPlan.aggregate({
            _sum: { price: true }, // ⬅️ Kasuta _sum otse
            where: {
                purchasedAt: { gte: start, lte: end },
                affiliateId: affiliateIds// ✅ Kasuta massiivi!
            }
        });

        // 📌 ✅ Leia müüdud plaanid
        const plansSold = await prisma.userPlan.groupBy({
            by: ['planName'],
            _count: { planName: true },
            where: {
                purchasedAt: { gte: start, lte: end },
                affiliateId: affiliateIds
            },
            orderBy: { _count: { planName: 'desc' } }
        });

        // 📌 ✅ Leia aktiivsed, aegunud ja kokku liikmed
        const activeMembers = await prisma.userPlan.count({
            where: {
                endDate: { gte: new Date() },
                affiliateId: affiliateIds
            }
        });

        const expiredMembers = await prisma.userPlan.count({
            where: {
                userId: {
                    notIn: (
                        await prisma.userPlan.findMany({
                            where: {
                                endDate: { gte: new Date() },
                                affiliateId: affiliateIds
                            },
                            select: { userId: true }
                        })
                    ).map(u => u.userId)
                },
                affiliateId: affiliateIds
            }
        });

        const totalMembers = await prisma.members.count({
            where: { affiliateId: affiliateIds }
        });

        // 📌 ✅ Tagasta vastus
        res.json({
            revenue: revenue._sum.price || 0,
            plansSold,
            activeMembers,
            expiredMembers,
            totalMembers
        });

    } catch (error) {
        console.error("❌ Error fetching finance data:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


module.exports = router;
