const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/records?type=...
exports.getRecords = async (req, res) => {
    const type = req.query.type || 'WOD';

    try {
        const userId = req.user.id; // JWT abil saadud kasutaja ID
        // Leia kõik salvestused
        const records = await prisma.record.findMany({
            where: { userId, type },
            orderBy: { date: 'desc' },
        });

        // Varem gruppisid recordid name kaupa, et saaks "latestRecords".
        // Taasskeem sama loogikat:
        const latestRecords = [];
        const namesSet = new Set();

        records.forEach((record) => {
            if (!namesSet.has(record.name)) {
                latestRecords.push(record);
                namesSet.add(record.name);
            }
        });

        res.json(latestRecords);
    } catch (error) {
        console.error('Error fetching records:', error);
        res.status(500).json({ error: 'Failed to fetch records.' });
    }
};

// GET /api/records/:name?type=...
exports.getRecordsByName = async (req, res) => {
    const { name } = req.params;
    const type = req.query.type || 'WOD';

    try {
        const userId = req.user.id; // JWT
        const records = await prisma.record.findMany({
            where: { userId, type, name },
            orderBy: { date: 'desc' },
            select: {
                id: true,
                date: true,
                score: true,
                weight: true,
                time: true,
                // Lisa teised väljad, kui vaja
            },
        });

        res.json(records);
    } catch (error) {
        console.error('Error fetching records by name:', error);
        res.status(500).json({ error: 'Failed to fetch records by name.' });
    }
};

// POST /api/records
exports.createRecord = async (req, res) => {
    const { type, name, date, score, weight, time } = req.body;

    try {
        const userId = req.user.id; // JWT
        // Koosta recordi andmed
        const recordData = {
            type,
            name,
            date: new Date(date),
            userId, // see on kõige tähtsam – seob kirje kasutajaga
            score: score || null,
            weight: weight ? parseFloat(weight) : null,
            time: time || null,
        };

        await prisma.record.create({ data: recordData });

        res.status(201).json({ message: 'Record added successfully!' });
    } catch (error) {
        console.error('Error adding record:', error);
        res.status(500).json({ error: 'Failed to add record.' });
    }
};

// DELETE /api/records/:id
exports.deleteRecord = async (req, res) => {
    const recordId = parseInt(req.params.id, 10);

    try {
        const userId = req.user.id; // JWT
        // Otsi record
        const record = await prisma.record.findUnique({
            where: { id: recordId },
        });

        if (!record || record.userId !== userId) {
            return res.status(404).json({ error: 'Record not found or not authorized.' });
        }

        await prisma.record.delete({
            where: { id: recordId },
        });

        res.status(200).json({ message: 'Record deleted successfully!' });
    } catch (error) {
        console.error('Error deleting record:', error);
        res.status(500).json({ error: 'Failed to delete record.', details: error.message });
    }
};
