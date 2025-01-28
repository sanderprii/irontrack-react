const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'salajane_jwt_voti';

exports.register = async (req, res) => {
    try {
        const { email, password, affiliateOwner } = req.body;
        // Kontrolli, kas väljad on täidetud
        if (!email || !password) {
            return res.status(400).json({ error: 'Email ja parool on kohustuslikud!' });
        }

        // Kontrolli, kas kasutaja on juba olemas
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Sellise emailiga kasutaja on juba olemas!' });
        }

        // Häši parool
        const hashedPassword = await bcrypt.hash(password, 10);

        // Loo uus kasutaja
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                affiliateOwner: affiliateOwner || false,
            },
        });

        // Loo JWT token
        const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({
            message: 'Kasutaja loodud!',
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                affiliateOwner: newUser.affiliateOwner,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Midagi läks valesti registreerimisel.' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kontrolli, kas väljad on täidetud
        if (!email || !password) {
            return res.status(400).json({ error: 'Email ja parool on kohustuslikud!' });
        }

        // Otsi kasutajat
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: 'Vale email või parool.' });
        }

        // Kontrolli parooli
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Vale email või parool.' });
        }

        // Loo JWT token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

        const userRole = user.affiliateOwner ? 'owner' : 'regular';



        res.status(200).json({
            message: 'Sisselogimine õnnestus',
            token,
            role: userRole,
            userId: user.id,
            user: {
                id: user.id,
                email: user.email,
                affiliateOwner: user.affiliateOwner,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Midagi läks valesti sisselogimisel.' });
    }
};

exports.getMe = async (req, res) => {


    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1]; // "Bearer <token>"
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded?.userId) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Leia kasutaja DBst
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }



        // Võid lisada lisakontrolli, nt kas treener, affiliateOwner jne
        return res.json({
            id: user.id,

            email: user.email,
            affiliateOwner: user.affiliateOwner,
            // jne ...
        });
    } catch (err) {
        console.error(err);
        return res.status(401).json({ error: 'Unauthorized' });
    }
};