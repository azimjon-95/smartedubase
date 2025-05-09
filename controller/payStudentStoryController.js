const PayStudentStory = require('../models/payStudentStory');
const Student = require('../models/student');
const Balans = require('../models/balans');

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

module.exports = {
    createPayment,
    getPayments,
    getPaymentById,
    updatePayment,
    deletePayment,
    getPaymentsByStudentId
};
