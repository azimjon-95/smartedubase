const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  groupId: { type: String, required: true, index: true },
  studentId: { type: String, required: true, index: true },
  subjects: { type: String, required: true },
  teacherId: { type: String, required: true },
  attendance: [
    {
      date: { type: String, required: true }, // Format: DD.MM.YYYY
      attendance: { type: String, enum: ['A', 'X'], required: true },
    },
  ],
  grades: [
    {
      date: { type: String, required: true }, // Format: DD.MM.YYYY
      grade: { type: String, enum: ['2', '3', '4', '5', 'X'], required: true },
    },
  ],
}, { timestamps: true });

// Indekslar performansi uchun
attendanceSchema.index({ groupId: 1, studentId: 1, 'attendance.date': 1 });
attendanceSchema.index({ groupId: 1, studentId: 1, 'grades.date': 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);


