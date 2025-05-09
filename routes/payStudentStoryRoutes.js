const express = require('express');
const router = express.Router();
const {
    createPayment,
    getPayments,
    getPaymentById,
    updatePayment,
    deletePayment,
    getPaymentsByStudentId
} = require('../controller/payStudentStoryController');
const {
    processMonthlyPayments
} = require('../controller/paymentProcessor');

router.post('/', createPayment);
router.get('/', getPayments);
router.get('/:id', getPaymentById);
router.get('/getByStudentId/:id', getPaymentsByStudentId);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment);
router.post('/process-payments', processMonthlyPayments);

module.exports = router;

