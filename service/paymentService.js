const Student = require('../models/student');
const PayStudentStory = require('../models/payStudentStory');

const updateIndebtedness = async () => {
    try {
        const students = await Student.find({ state: 'active' }); // Only active students
        const today = new Date();
        const currentMonth = (today.getMonth() + 1);
        const currentYear = today.getFullYear();
        const currentMonthStart = new Date(currentYear, currentMonth, 1);

        for (const student of students) {
            const lastPayment = await PayStudentStory.findOne();

            if (!lastPayment) {
                const debtorDate = new Date(student.indebtedness.debtorDate);
                const debtorMonth = (debtorDate.getMonth() + 1);
                const debtorYear = debtorDate.getFullYear();

                if (debtorMonth !== currentMonth || debtorYear !== currentYear) {
                    student.indebtedness.debtorPay += student.payForLesson;
                    student.indebtedness.debtorDate = currentMonthStart.toISOString().split('T')[0];
                    await student.save();
                }
            }
        }

    } catch (error) {
        console.error('Error updating indebtedness:', error);
    }
};

module.exports = updateIndebtedness;