const express = require('express');
const router = express.Router();
const {
    getGenerateMockData,
    createPayment,
    getPayments,
    getPaymentById,
    updatePayment,
    deletePayment,
    getPaymentsByStudentId,
} = require('../controller/payStudentStoryController');
const {
    processMonthlyPayments
} = require('../controller/paymentProcessor');

router.post('/payments', createPayment);
router.get('/payments', getPayments);
router.get('/payments/:id', getPaymentById);
router.get('/payments/getByStudentId/:id', getPaymentsByStudentId);
router.put('/payments/:id', updatePayment);
router.delete('/payments/:id', deletePayment);
router.post('/process-payments', processMonthlyPayments);
router.get('/generatechartdata', getGenerateMockData);
module.exports = router;

