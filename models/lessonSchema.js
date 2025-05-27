const mongoose = require('mongoose');

// Har bir dars uchun schema
const lessonSchema = new mongoose.Schema({
    lessonName: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    homework: {
        type: String,
        required: true,
        trim: true,
    },
    state: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Guruh va dars jadvali uchun schema
const groupSchema = new mongoose.Schema(
    {
        groupaIds: {
            type: [String],
            trim: true,
            default: [],
        },
        subjects: {
            type: [String],
            default: [],
        },
        level: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'beginner',
            trim: true,
        },
        step: {
            type: Number,
            min: 1,
            max: 10,
            default: 1,
        },
        lessons: [lessonSchema],
    },
    { timestamps: true }
);

// Modelni yaratish
const LessonSchedule = mongoose.model('LessonSchedul', groupSchema);
module.exports = LessonSchedule;
