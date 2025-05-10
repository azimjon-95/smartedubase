const PayStudentStory = require('../models/payStudentStory');
const Student = require('../models/student');
const Balans = require('../models/balans');
const moment = require('moment');

const createPayment = async (req, res) => {
    try {
        const { studentId, studentFees, state } = req.body;
        const newPayment = new PayStudentStory(req.body);

        await newPayment.save();

        const student = await Student.findById(studentId);
        if (student) {
            student.indebtedness -= studentFees;
            await student.save();
        }

        // Balans yangilash
        const balansList = await Balans.find();
        if (balansList.length > 0) {
            const balans = balansList[0];
            if (state) {
                balans.balans = (parseFloat(balans.balans) + parseFloat(studentFees)).toString();
            } else {
                balans.balans = (parseFloat(balans.balans) - parseFloat(studentFees)).toString();
            }
            await balans.save();
        } else {
            const newBalans = new Balans({
                eduId: studentId,
                balans: studentFees.toString(),
            });
            await newBalans.save();
        }

        res.status(201).json(newPayment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getPayments = async (req, res) => {
    try {
        const payments = await PayStudentStory.find();
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPaymentById = async (req, res) => {
    try {
        const payment = await PayStudentStory.findById(req.params.id);
        if (!payment) return res.status(404).json({ message: 'Payment not found' });
        res.status(200).json(payment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

async function getPaymentsByStudentId(req, res) {
    try {
        const studentId = req.params.id;
        // MongoDB’da studentId ga mos keladigan barcha yozuvlarni topish
        const payments = await PayStudentStory.find({ studentId: studentId });

        res.status(200).json(payments);
    } catch (error) {
        console.error('Xatolik yuz berdi:', error);
        throw error;
    }
}


const updatePayment = async (req, res) => {
    try {
        const payment = await PayStudentStory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!payment) return res.status(404).json({ message: 'Payment not found' });
        res.status(200).json(payment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deletePayment = async (req, res) => {
    try {
        const payment = await PayStudentStory.findByIdAndDelete(req.params.id);
        if (!payment) return res.status(404).json({ message: 'Payment not found' });
        res.status(200).json({ message: 'Payment deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Generate mock data function
// Set moment locale to Russian for month names
moment.locale('ru');

// Russian month names mapping (optional, since moment already handles this)
const russianMonths = {
    'январь': 'Январь',
    'февраль': 'Февраль',
    'март': 'Март',
    'апрель': 'Апрель',
    'май': 'Май',
    'июнь': 'Июнь',
    'июль': 'Июль',
    'август': 'Август',
    'сентябрь': 'Сентябрь',
    'октябрь': 'Октябрь',
    'ноябрь': 'Ноябрь',
    'декабрь': 'Декабрь',
};

// Function to fetch and format data from MongoDB
const fetchChartData = async () => {
    const currentMonth = moment().format('MMMM'); // e.g., "май"
    const capitalizedMonth = russianMonths[currentMonth.toLowerCase()] || currentMonth;
    const daysInMonth = moment().daysInMonth();
    const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Initialize arrays for income and expenses
    const income = new Array(daysInMonth).fill(0);
    const expenses = new Array(daysInMonth).fill(0);

    // Query PayStudentStory for the current month's data
    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();

    try {
        const records = await PayStudentStory.find({
            studentFeesDate: {
                $gte: startOfMonth,
                $lte: endOfMonth,
            },
        }).lean();

        // Aggregate income and expenses by day
        records.forEach((record) => {
            // Validate studentId (optional, if you suspect invalid data)
            if (record.studentId && !mongoose.Types.ObjectId.isValid(record.studentId)) {
                console.warn(`Invalid studentId found: ${record.studentId}`);
                return; // Skip invalid records
            }

            const day = moment(record.studentFeesDate).date(); // Get day of the month (1–31)
            const amount = record.studentFees || 0;

            if (record.state === true) {
                income[day - 1] += amount; // Add to income
            } else {
                expenses[day - 1] += amount; // Add to expenses
            }
        });

        return {
            labels,
            income,
            expenses,
            month: capitalizedMonth,
        };
    } catch (error) {
        console.error('Error querying PayStudentStory:', error);
        throw error; // Let the route handler handle the error
    }
};

// Express route handler
const getGenerateMockData = async (req, res) => {

    try {
        const chartData = await fetchChartData();
        res.status(200).json({
            success: true,
            data: chartData,
            message: 'Chart data fetched successfully',
        });
    } catch (error) {
        console.error('Error fetching chart data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch chart data',
            error: error.message,
        });
    }
};

module.exports = {
    getGenerateMockData,
    createPayment,
    getPayments,
    getPaymentById,
    updatePayment,
    deletePayment,
    getPaymentsByStudentId
};
