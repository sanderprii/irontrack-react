const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getClassLeaderboard = async (req, res) => {
    const classId = parseInt(req.query.classId);
    if (!classId) {
        return res.status(400).json({ error: "Class ID is required." });
    }

    try {
        const leaderboard = await prisma.classLeaderboard.findMany({
            where: { classId },
            include: {
                user: {
                    select: { fullName: true },
                },
            },
            orderBy: { score: "desc" },
        });

        res.json(leaderboard.map(entry => ({
            id: entry.id,
            fullName: entry.user.fullName || "Anonymous",
            score: entry.score,
            scoreType: entry.scoreType.toLowerCase(),
        })));
    } catch (error) {
        console.error("❌ Error fetching leaderboard:", error);
        res.status(500).json({ error: "Failed to fetch leaderboard." });
    }
};

module.exports = { getClassLeaderboard };
