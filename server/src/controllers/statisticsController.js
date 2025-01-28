const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getStatistics = async (req, res) => {
    try {
        const userId = parseInt( req.query.userId);
console.log(userId);
        // total trainings
        const totalTrainings = await prisma.training.count({ where: { userId } });

        // trainings per month (viimased 12)
        const now = new Date();
        const months = [];
        for (let i = 0; i < 12; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                year: date.getFullYear(),
                month: date.getMonth() + 1,
            });
        }

        const trainingsPerMonth = [];
        for (const m of months) {
            const startDate = new Date(m.year, m.month - 1, 1);
            const endDate = new Date(m.year, m.month, 0);
            const count = await prisma.training.count({
                where: {
                    userId,
                    date: {
                        gte: startDate,
                        lte: endDate,
                    }
                },
            });
            trainingsPerMonth.push({
                year: m.year,
                month: m.month,
                count,
            });
        }

        // trainings by type
        const trainingsByType = await prisma.training.groupBy({
            by: ['type'],
            where: { userId },
            _count: { type: true },
        });

        // current month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const trainingsThisMonth = await prisma.training.count({
            where: {
                userId,
                date: {
                    gte: startOfMonth,
                    lte: now,
                }
            }
        });

        // monthlyGoal
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { monthlyGoal: true },
        });

        res.json({
            totalTrainings,
            trainingsPerMonth,
            trainingsByType,
            trainingsThisMonth,
            monthlyGoal: user?.monthlyGoal || 0,
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics.' });
    }
};

exports.updateMonthlyGoal = async (req, res) => {
    const userId = req.user.id;
    const { monthlyGoal } = req.body;

    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                monthlyGoal: parseInt(monthlyGoal, 10)
            }
        });
        res.json({ message: 'Monthly goal updated successfully.' });
    } catch (error) {
        console.error('Error updating monthly goal:', error);
        res.status(500).json({ error: 'Failed to update monthly goal.' });
    }
};
