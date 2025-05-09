const Groups = require('../models/groups'); // Path to your Groups model
const mongoose = require('mongoose');
const Student = require('../models/student'); // Path to your Student model

// Schema to track monthly payment clicks
const PaymentClickSchema = new mongoose.Schema({
    year: { type: Number, required: true },
    month: { type: Number, required: true }, // 1-12
    groupId: { type: String, required: true },
    clickedAt: { type: Date, default: Date.now },
});

const PaymentClick = mongoose.model('PaymentClick', PaymentClickSchema);


// Oylik to'lovlarni qayta ishlash uchun Express route handler
async function processMonthlyPayments(req, res) {
    try {
        // Joriy sanani olish
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // JavaScript oylari 0 dan boshlanadi

        // Barcha guruhlarni topish (faqat kerakli maydonlar)
        const groups = await Groups.find({}, '_id mothlyPay').lean();
        if (!groups.length) {
            return res.status(404).json({ success: false, message: 'Guruhlar topilmadi.' });
        }

        let totalStudentsProcessed = 0;
        const processedGroupIds = [];
        const errors = [];

        // Joriy oyda qayta ishlangan guruhlarni bir so'rovda tekshirish
        const existingClicks = await PaymentClick.find({
            year: currentYear,
            month: currentMonth,
            groupId: { $in: groups.map(g => g._id.toString()) },
        }).lean();
        const processedGroups = new Set(existingClicks.map(click => click.groupId));

        // Har bir guruhni qayta ishlash
        for (const group of groups) {
            const groupId = group._id.toString();
            const monthlyPay = group.mothlyPay;

            // Agar guruh bu oyda allaqachon qayta ishlangan bo'lsa, o'tkazib yuborish
            if (processedGroups.has(groupId)) {
                errors.push(`${groupId} guruh bu oyda allaqachon qayta ishlangan.`);
                continue;
            }

            // Guruhdagi mos keluvchi talabalarni topish
            const students = await Student.find(
                {
                    groupId,
                    createdAt: {
                        $lt: new Date(currentYear, currentMonth - 1, 1), // Joriy oyda yaratilgan talabalarni chiqarib tashlash
                    },
                    $or: [
                        { 'indebtedness.debtorDate': { $exists: false } },
                        {
                            'indebtedness.debtorDate': {
                                $lt: new Date(currentYear, currentMonth - 1, 1),
                            },
                        },
                    ],
                },
                '_id indebtedness'
            ).lean();

            if (!students.length) {
                errors.push(`${groupId} guruhda mos talabalar topilmadi.`);
                continue;
            }

            // Ommaviy yangilash operatsiyalarini tayyorlash
            const bulkOps = students.map(student => ({
                updateOne: {
                    filter: { _id: student._id },
                    update: {
                        $inc: { 'indebtedness.debtorPay': monthlyPay },
                        $set: {
                            'indebtedness.debtorDate': now.toISOString(),
                        },
                    },
                },
            }));

            // Ommaviy yangilashlarni bajarish
            await Student.bulkWrite(bulkOps);

            // To'lov klikini qayd etish
            await PaymentClick.create({
                year: currentYear,
                month: currentMonth,
                groupId,
            });

            totalStudentsProcessed += students.length;
            processedGroupIds.push(groupId);
        }

        if (totalStudentsProcessed === 0) {
            return res.status(400).json({
                success: false,
                message: "To'lov yangilanishi uchun mos talabalar topilmadi.",
                errors,
            });
        }

        return res.status(200).json({
            success: true,
            message: `${totalStudentsProcessed} ta talaba uchun ${processedGroupIds.length} ta guruh bo'yicha to'lovlar qayta ishlangan.`,
            processedGroupIds,
            totalStudentsProcessed,
            errors,
        });
    } catch (error) {
        console.error("To'lovlarni qayta ishlashda xato:", error);
        return res.status(500).json({
            success: false,
            message: "To'lovlarni qayta ishlashda server xatosi.",
            error: error.message,
        });
    }
}
module.exports = { processMonthlyPayments, PaymentClick };