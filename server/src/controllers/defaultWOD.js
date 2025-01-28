const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const searchDefaultWODs = async (req, res) => {
    const query = req.query.q;

    if (!query || query.trim() === '') {
        return res.status(400).json({ error: 'Query parameter is required.' });
    }

    try {
        const wods = await prisma.defaultWOD.findMany({
            where: {
                name: { contains: query.toUpperCase() },
            },
            take: 10, // Limiteerime 10 tulemusega
        });

        res.json(wods);
    } catch (error) {
        console.error('Error searching Default WODs:', error);
        res.status(500).json({ error: 'Failed to search Default WODs.' });
    }
};

module.exports = { searchDefaultWODs };