// controllers/logoController.js
const sharp = require('sharp');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const uploadLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Kontrolli faili suurust – maksimaalselt 1MB (1MB = 1048576 baiti)
        if (req.file.size > 1048576) {
            return res.status(400).json({ error: 'File size exceeds 1MB limit' });
        }

        const MAX_WIDTH = 200;
        const MAX_HEIGHT = 200;

        // Vähenda pilti proportsionaalselt (kasutades "inside" fit'i ja withoutEnlargement valikut)
        const resizedBuffer = await sharp(req.file.buffer)
            .resize({
                width: MAX_WIDTH,
                height: MAX_HEIGHT,
                fit: 'contain',
                withoutEnlargement: true,
                background: { r: 255, g: 255, b: 255, alpha: 0 },
            })
            .toBuffer();

        // Muuda vähendatud pilt base64 stringiks
        const base64Image = resizedBuffer.toString('base64');
        const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;

        // Saada affiliateId request body-st
        const affiliateId = req.body.affiliateId;
        if (!affiliateId) {
            return res.status(400).json({ error: 'Affiliate ID not provided' });
        }

        // Uuenda affiliate logo andmebaasis Prisma abil
        const updatedAffiliate = await prisma.affiliate.update({
            where: { id: parseInt(affiliateId) },
            data: { logo: dataUrl },
        });

        return res
            .status(200)
            .json({ message: 'Logo uploaded successfully', affiliate: updatedAffiliate });
    } catch (error) {
        console.error('Error uploading logo:', error);
        return res.status(500).json({ error: 'Error uploading logo' });
    }
};

const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        if (req.file.size > 1048576) {
            return res.status(400).json({ error: 'File size exceeds 1MB limit' });
        }

        const resizedBuffer = await sharp(req.file.buffer)
            .resize({ width: 200, height: 200, fit: 'cover', position: 'center', background: { r: 255, g: 255, b: 255, alpha: 0 } })
            .toBuffer();

        const base64Image = resizedBuffer.toString('base64');
        const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(req.body.userId) },
            data: { logo: dataUrl },
        });

        return res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        return res.status(500).json({ error: 'Error uploading profile picture' });
    }
};

module.exports = { uploadLogo, uploadProfilePicture };
