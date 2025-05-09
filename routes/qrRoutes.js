const express = require('express');
const router = express.Router();
const { generateQr, markAttendance } = require('../controller/generateQr');


router.get('/generate-qr/:studentId', generateQr);
router.post('/mark-attendance', markAttendance);

module.exports = router;
