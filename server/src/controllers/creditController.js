const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();

const getUserCredits = async (req, res) => {
    const affiliateId = parseInt(req.query.affiliateId, 10);
    const userId = parseInt(req.query.userId, 10);


    const role = req.headers.role;
    console.log(role)

    try {
        let credits
        if (role === 'regular') {
            credits = await prisma.credit.findMany({
                where: {userId},
                include: {
                    affiliate: true
                },

            });
        } else {


            credits = await prisma.credit.findMany({
                where: {userId, affiliateId},
                include: {
                    affiliate: true
                }
            });
        }

        res.json(credits);
    } catch (error) {
        console.error("Error fetching user credits:", error);
        res.status(500).json({error: "Internal server error"});
    }
};

const getCreditHistory = async (req, res) => {
    const affiliateId = parseInt(req.query.affiliateId, 10);
    const userId = parseInt(req.query.userId, 10);

    const role = req.headers.role;

    try {
        let history

        if (role === 'regular') {
            history = await prisma.creditTransaction.findMany({
                where: {userId},
                include: {
                    affiliate: true
                },
                orderBy: {createdAt: "desc"},
            });
        } else {

            history = await prisma.creditTransaction.findMany({
                where: {userId, affiliateId},
                include: {
                    affiliate: true
                },
                orderBy: {createdAt: "desc"},
            });
        }

        res.json(history);
    } catch (error) {
        console.error("Error fetching credit history:", error);
        res.status(500).json({error: "Internal server error"});
    }
}

const addCredit = async (req, res) => {
    const {userId, amount, affiliateId, description} = req.body;

    try {
        const isCreditAccount = await prisma.credit.findFirst({
            where: {userId, affiliateId}
        });

        if (!isCreditAccount) {
            await prisma.credit.create({
                data: {
                    userId,
                    affiliateId,
                    credit: amount
                }
            });

            const creditAccount = await prisma.credit.findFirst({
                where: {userId, affiliateId}
            });


        } else {
            await prisma.credit.update({
                where: {
                    userId_affiliateId: { userId, affiliateId }
                },
                data: {
                    credit: {
                        increment: amount
                    }
                }
            });


        }

        const creditId = isCreditAccount ? isCreditAccount.id : creditAccount.id;

        const invoicenumberDateandTime = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);


        await prisma.creditTransaction.create({
            data: {
                userId,
                affiliateId,
                creditAmount: amount,

                description,
                paymentRef: invoicenumberDateandTime,
                creditId: creditId
            }
        });

        res.json(credit);
    } catch (error) {
        console.error("Error adding credit:", error);
        res.status(500).json({error: "Internal server error"});
    }
}

module.exports = {
    getUserCredits,
    getCreditHistory,
    addCredit
};