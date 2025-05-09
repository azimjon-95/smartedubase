const mongoose = require('mongoose');

const payStudentStorySchema = new mongoose.Schema({
    fullName: { type: String },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    studentFees: { type: Number }, // Studentni qilgan to'lovi
    studentFeesDate: { type: Date, default: Date.now }, // Student to'lov qilgan sana
    studentFeesTime: { type: String, default: new Date().toLocaleTimeString() }, // Student to'lov qilgan soat
    month: { type: String, default: new Date().toLocaleString('default', { month: 'long' }) }, // To'lov oy nomi
    subject: { type: [String] },
    eduId: { type: String },
    category: { type: String },
    description: { type: String },
    state: { type: String, default: true },  // true kirim - false chiqim
    createdAt: { type: Date, default: Date.now },
});

const PayStudentStory = mongoose.model('PayStudentStory', payStudentStorySchema);

module.exports = PayStudentStory;
