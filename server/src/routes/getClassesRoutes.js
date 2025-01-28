const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const ensureAuthenticated = require("../middlewares/ensureAuthenticatedJWT");

// ✅ Get affiliate name by ID
router.get("/affiliate-name", ensureAuthenticated, async (req, res) => {
    const affiliateId = parseInt(req.query.affiliateId);
    if (!affiliateId) {
        return res.status(400).json({ error: "Affiliate ID required." });
    }

    try {
        const affiliate = await prisma.affiliate.findUnique({
            where: { id: affiliateId },
            select: { name: true },
        });

        if (!affiliate) {
            return res.status(404).json({ error: "Affiliate not found." });
        }

        res.json(affiliate);
    } catch (error) {
        console.error("Error fetching affiliate name:", error);
        res.status(500).json({ error: "Failed to fetch affiliate name." });
    }
});

// ✅ Search affiliates by name (autocomplete)
router.get("/search-affiliates", ensureAuthenticated, async (req, res) => {
    const q = req.query.q || "";
    if (!q) return res.status(400).json({ error: "Query required." });

    try {
        const affiliates = await prisma.affiliate.findMany({
            where: {
                name: {
                    contains: q
                },
            },
            select: { id: true, name: true },
            take: 10,
        });

        res.json(affiliates);
    } catch (error) {
        console.error("Error searching affiliates:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Get affiliate details + trainers by name
router.get("/get-affiliate-by-id", ensureAuthenticated, async (req, res) => {
    const affiliateId = parseInt(req.query.id); // Teisendame ID täisarvuks
    if (!affiliateId) return res.status(400).json({ error: "Affiliate ID required." });

    try {
        const affiliate = await prisma.affiliate.findUnique({ // Kasutame findUnique
            where: {
                id: affiliateId,
            },
            include: {
                trainers: {
                    include: {
                        trainer: true,
                    },
                },
            },
        });

        if (!affiliate) {
            return res.status(404).json({ error: "Affiliate not found." });
        }

        const trainers = affiliate.trainers.map((t) => ({
            id: t.trainerId,
            username: t.trainer.username,
            fullName: t.trainer.fullName,
        }));

        res.json({ affiliate, trainers });
    } catch (error) {
        console.error("Error getting affiliate:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// ✅ Get affiliate plans by ownerId
router.get("/affiliate-plans", ensureAuthenticated, async (req, res) => {
    const ownerId = parseInt(req.query.ownerId);

    console.log("ownerId", ownerId);

    if (!ownerId) {
        return res.status(400).json({ error: "Owner ID required." });
    }

    try {
        const plans = await prisma.plan.findMany({
            where: { ownerId },
            select: {
                id: true,
                name: true,
                validityDays: true,
                price: true,
                sessions: true,
                additionalData: true,
            },
        });

        res.json(plans);
    } catch (error) {
        console.error("Error fetching plans:", error);
        res.status(500).json({ error: "Failed to fetch plans." });
    }
});

// ✅ Add affiliate as home gym
router.post("/add-home-affiliate", ensureAuthenticated, async (req, res) => {
    const { affiliateId } = req.body;

    try {
        await prisma.user.update({
            where: { id: req.user?.id },
            data: { homeAffiliate: parseInt(affiliateId) },
        });

        res.status(201).json({ message: "Added for Home gym!" });
    } catch (error) {
        console.error("Error adding Home gym:", error);
        res.status(500).json({ error: "Failed to add home gym!" });
    }
});

// ✅ Remove home gym
router.post("/remove-home-affiliate", ensureAuthenticated, async (req, res) => {
    try {
        await prisma.user.update({
            where: { id: req.user?.id },
            data: { homeAffiliate: null },
        });

        res.status(201).json({ message: "Affiliate removed successfully!" });
    } catch (error) {
        console.error("Error removing affiliate:", error);
        res.status(500).json({ error: "Failed to remove affiliate." });
    }
});

// ✅ Get user's home affiliate
router.get("/user-home-affiliate", ensureAuthenticated, async (req, res) => {
    try {

        const user = await prisma.user.findUnique({
            where: { id: req.user?.id },
            select: { homeAffiliate: true },
        });

        res.json({ homeAffiliate: user?.homeAffiliate || null });
    } catch (error) {
        console.error("Error fetching user's home affiliate:", error);
        res.status(500).json({ error: "Failed to fetch home affiliate." });
    }
});

module.exports = router;
