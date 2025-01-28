const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// CREATE training
exports.createTraining = async (req, res) => {
    const {
        type,
        date,
        score,
        wodName,
        wodType,
        exercises,
    } = req.body;
    const userId = req.user.id;
    try {
        if (!type || !date) {
            return res.status(400).json({ error: 'Invalid training data.' });
        }

        // Kasutaja ID võib tulla nt req.session.userId (session) või req.user.id (JWT)
        // Näites oletame session:


        const trainingData = {
            type,
            wodName: wodName || null,
            wodType: wodType || null,
            date: new Date(date),
            score: score || null,
            userId: userId,
            exercises: {
                // Loome ühe Exercise kirje (või mitu). Siin on üks massiiv. Vana kood lisas ühe:
                create: { exerciseData: exercises || '' },
            },
        };

        const training = await prisma.training.create({
            data: trainingData,
            include: { exercises: true },
        });

        // Laeme kõik treeningud, tagastame front-endile
        const allTrainings = await prisma.training.findMany({
            where: { userId },
            include: { exercises: true },
            orderBy: { date: 'desc' },
        });

        res.status(201).json({
            message: 'Training added successfully!',
            trainings: allTrainings,
        });
    } catch (error) {
        console.error('Error saving training:', error);
        res.status(500).json({
            error: 'Failed to save training.',
            details: error.message,
        });
    }
};

// GET trainings
exports.getTrainings = async (req, res) => {
    try {

        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated.' });
        }

        const allTrainings = await prisma.training.findMany({
            where: { userId },
            include: { exercises: true },
            orderBy: { date: 'desc' },
        });

        res.json(allTrainings);
    } catch (error) {
        console.error('Error fetching trainings:', error);
        res.status(500).json({ error: 'Failed to load trainings.' });
    }
};

// DELETE training
exports.deleteTraining = async (req, res) => {
    const trainingId = parseInt(req.params.id, 10);

    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated.' });
        }

        // Kas treening kuulub sellele kasutajale?
        const training = await prisma.training.findUnique({
            where: { id: trainingId },
        });

        if (!training || training.userId !== userId) {
            return res.status(404).json({ error: 'Training not found or not authorized.' });
        }

        // Kustutame kõigepealt exercises
        await prisma.exercise.deleteMany({
            where: { trainingId },
        });

        // Seejärel treening
        await prisma.training.delete({
            where: { id: trainingId },
        });

        res.status(200).json({ message: 'Training deleted successfully!' });
    } catch (error) {
        console.error('Error deleting training:', error);
        res.status(500).json({
            error: 'Failed to delete training.',
            details: error.message,
        });
    }
};

// UPDATE training
exports.updateTraining = async (req, res) => {
    const trainingId = parseInt(req.params.id, 10);
    const { type, date, wodName, wodType, score, exercises } = req.body;

    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated.' });
        }

        // Kontrollime, kas treening kuulub kasutajale
        const training = await prisma.training.findUnique({
            where: { id: trainingId },
        });

        if (!training || training.userId !== userId) {
            return res.status(403).json({
                error: 'Not authorized to update this training.',
            });
        }

        // Uuendame training + exercises
        // Vana kood: kustutab exercises ja loob uued
        const updatedTraining = await prisma.training.update({
            where: { id: trainingId },
            data: {
                type,
                date: new Date(date),
                wodName,
                wodType,
                score,
                exercises: {
                    deleteMany: {}, // kustuta vanad
                    create: exercises.map((ex) => ({
                        exerciseData: ex.exerciseData || '',
                    })),
                },
            },
            include: { exercises: true },
        });

        res.status(200).json({
            message: 'Training updated successfully!',
            training: updatedTraining,
        });
    } catch (error) {
        console.error('Error updating training:', error);
        res.status(500).json({ error: 'Failed to update training.' });
    }
};
