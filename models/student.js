const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  groupId: { type: String, required: true },
  teacherId: { type: String, required: true },
  teacherFullName: { type: [String], required: true },
  lessonTime: { type: String, required: true },
  lessonDate: { type: String, required: true },
  payForLesson: { type: Number, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  middleName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  address: { type: String, required: true },
  studentPhoneNumber: { type: String, required: true },
  parentPhoneNumber: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female'], required: true },
  subject: { type: [String] },
  state: { type: String, default: "new" },
  coin: { type: Number, default: 0 },
  eduId: { type: String },
  indebtedness: {
    debtorDate: { type: String },
    debtorPay: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;


