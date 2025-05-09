const mongoose = require('mongoose');

const RegistrGrupsationSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true },
    studentsLength: { type: Number, default: 0 },
    lessonTime: { type: String, required: true },
    subjects: { type: [String], required: true },
    teachers: { type: [String], required: true },
    state: { type: String, required: true },
    schedule: { type: String },
    teacherId: { type: String },
    mothlyPay: { type: Number, required: true },
    eduId: { type: String },
});

const Groups = mongoose.model('RegistrationGrups', RegistrGrupsationSchema);
module.exports = Groups;


