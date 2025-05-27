const express = require('express');
const router = express.Router();
const attendanceController = require('../controller/attendanceController');

router.post('/attendance', attendanceController.createOrUpdateAttendance);
router.get('/attendance/:groupId', attendanceController.getAttendanceByGroup);
router.put('/attendance', attendanceController.updateAttendance);
//const { groupId, studentId } = req.params;
router.get('/attendance/:groupId/:studentId', attendanceController.getAttendanceByGroupAndStudent);
router.delete('/attendance', attendanceController.deleteAttendance);

module.exports = router;








