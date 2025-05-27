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

    // ✅ Ixtiyoriy va default qiymatli daraja va bosqich
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner',
        lowercase: true,
        trim: true,
        required: false,
    },
    step: {
        type: Number,
        min: 1,
        max: 10,
        default: 1,
        required: false,
    },
});

const Groups = mongoose.model('RegistrationGrups', RegistrGrupsationSchema);
module.exports = Groups;
