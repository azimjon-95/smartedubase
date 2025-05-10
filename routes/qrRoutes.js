const express = require('express');
const router = express.Router();
const { markAttendance } = require('../controller/generateQr');


router.post('/mark-attendance', markAttendance);

module.exports = router;
