const mongoose = require('mongoose');

// Har bir dars uchun schema
const pastLessonReviewSchema = new mongoose.Schema({
    groupaId: {
        type: String,
        trim: true,
    },
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
    }
},
    { timestamps: true }
);

// Modelni yaratish
const PastLessonReview = mongoose.model('PastLessonReview', pastLessonReviewSchema);
module.exports = PastLessonReview;
