const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


const express = require('express');
require('dotenv').config();


const cors = require('cors');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const trainingRoutes = require('./routes/trainingRoutes');
const recordsRoutes = require('./routes/recordsRoutes');
const authRoutes = require('./routes/auth');
const defaultWodRoutes = require('./routes/defaultWODRoutes');
const userRoutes = require('./routes/userRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');
const affiliateRoutes = require('./routes/affiliateRoutes');
const planRoutes = require('./routes/planRoutes');
const classRoutes = require("./routes/classRoutes");
const wodRoutes = require("./routes/wodRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const membersRoutes = require("./routes/membersController");
const financeRoutes = require("./routes/financeRoutes");
const getClassesRoutes = require("./routes/getClassesRoutes");
const creditRoutes = require('./routes/creditRoutes');
const logoRoutes = require('./routes/logoRoutes');

const app = express();
app.set('trust proxy', 1);


const allowedOrigins = [
    'http://localhost:3000',
    'https://www.sanderprii.me',
    'https://www.sanderprii.me/api',
    'https://sanderprii.me',
];

app.use(cors({
    origin: function(origin, callback) {
        // Kui päringu päritolu pole määratud (nt Postmani või server-to-server päringud), lase see läbi
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'CORS error: This site (' + origin + ') is not allowed to access the resource.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.json());



// Liidame auth-routingu
app.use('/api/auth', authRoutes);

app.use('/api/training', trainingRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/wods', defaultWodRoutes);
app.use('/api/records', recordsRoutes);

app.use('/api/user', userRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/my-affiliate', affiliateRoutes);
app.use("/api", affiliateRoutes);
app.use('/api/affiliate', affiliateRoutes);

app.use("/api", planRoutes);
app.use("/api", classRoutes);
app.use("/api", wodRoutes);
app.use("/api", leaderboardRoutes);
app.use("/api", membersRoutes);
app.use("/api", financeRoutes);
app.use("/api", getClassesRoutes);
app.use('/api', logoRoutes);
app.use('/api', creditRoutes);

// Lihtne test endpoint
app.get('/api', (req, res) => {
    res.json({ message: 'Tere tulemast meie API-sse!' });
});

process.on('uncaughtException', (err) => {
    console.error('Kritiline viga:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Töötlemata lubamus:', promise, 'Põhjus:', reason);
});

async function checkDatabase() {
    try {
        await prisma.$connect();
        console.log('Andmebaasi ühendus OK');
    } catch (error) {
        console.error('Andmebaasi ühenduse viga:', error);
        process.exit(1);
    }
}

checkDatabase();

// Serveri käivitamine
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server käivitunud pordil ${PORT}`);
});
