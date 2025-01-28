const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
// kui sul on password validation:
const { validatePassword } = require('../utils/passwordValidation');
// jms

exports.getUserData = async (req, res) => {
    // varem: const userId = parseInt(req.query.userId);
    // aga tavaliselt me tahame JWT-s olevat userId, mitte query parametrit
    const userId = req.user.id;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        res.json(user);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Failed to fetch user data.' });
    }
};

// Visit history
exports.getVisitHistory = async (req, res) => {
    const userId = req.user.id;
    try {
        const visits = await prisma.classAttendee.findMany({
            where: { userId },
            include: { classSchedule: true },
            orderBy: { classId: 'desc' }
        });
        res.json(visits);
    } catch (error) {
        console.error('Error fetching user visit history:', error);
        res.status(500).json({ error: 'Failed to fetch user visit history.' });
    }
};

// Purchase history
exports.getPurchaseHistory = async (req, res) => {
    const userId = req.query.userId;
    try {
        const plans = await prisma.userPlan.findMany({
            where: { userId: parseInt(userId) },
            orderBy: { id: 'desc' }
        });
        res.json(plans);
    } catch (error) {
        console.error('Error fetching user plans:', error);
        res.status(500).json({ error: 'Failed to fetch user plans.' });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Check old password
        const passwordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ error: 'Invalid current password.' });
        }



        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        res.json({ message: 'Password changed successfully!' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'An error occurred while changing password.' });
    }
};

// Edit profile
exports.editProfile = async (req, res) => {
    const userId = req.user.id;
    const { fullName, dateOfBirth, email } = req.body;

    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                fullName: fullName || null,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                email: email || null,
            },
        });

        res.status(200).json({ message: 'Profile updated successfully!' });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ error: 'An error occurred while updating your profile.' });
    }
};

// getUser for general profile
exports.getUser = async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                credit: true,
                fullName: true,
                email: true,
                phone: true,
                credit: true,
                homeAffiliate: true,
                monthlyGoal: true,
                logo: true,
            }
        });
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user.' });
    }
};

// Update user data (PUT /api/user)
exports.updateUserData = async (req, res) => {
    const userId = req.user.id;
    const { fullName, email, dateOfBirth } = req.body;

    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                fullName,
                email,

            },
        });
        res.json({ message: 'User data updated successfully.' });
    } catch (error) {
        console.error('Error updating user data:', error);
        res.status(500).json({ error: 'Failed to update user data.' });
    }
};

// get user-plans by affiliateId
exports.getUserPlansByAffiliate = async (req, res) => {
    const userId = req.user.id;
    const { affiliateId } = req.query;

    if (!affiliateId) {
        return res.status(400).json({ error: 'affiliateId is required.' });
    }

    try {
        const userPlans = await prisma.userPlan.findMany({
            where: {
                affiliateId: parseInt(affiliateId, 10),
                userId,
            },
            select: {
                id: true,
                planId: true,
                planName: true,
                validityDays: true,
                price: true,
                purchasedAt: true,
                endDate: true,
                sessionsLeft: true,

            },
        });
        res.json(userPlans);
    } catch (error) {
        console.error('Error fetching user plans by affiliate:', error);
        res.status(500).json({ error: 'Server error fetching user plans.' });
    }
};
