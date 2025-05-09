const mongoose = require('mongoose');
const { Schema } = mongoose;

// Ustozlar uchun schema
const teacherSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    middleName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        required: true,
        enum: ['Erkak', 'Ayol']
    },
    nationality: {
        type: String,
        required: true,
        enum: [
            'O‘zbekiston', 'Rossiya', 'AQSH', 'Birlashgan Qirollik', 'Germaniya', 'Fransiya', 'Xitoy', 'Yaponiya', 'Boshqa'
        ]
    },
    maritalStatus: {
        type: String,
        required: true,
        enum: ['Single', 'Married', 'Divorced', 'Widowed']
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        enum: [
            'algebra', 'geometriya', 'matematik-analiz', 'fizika', 'kimyo', 'biologiya', 'tarix', 'geografiya', 'sotsiologiya',
            'ingliz-tili-kattalarga', 'ingliz-tili-bolalarga', 'rus-tili', 'fransuz-tili', 'nemis-tili', 'koreys-tili', 'adabiyot',
            'ona-tili', 'webdasturlash', 'mental-arifmetika'
        ]
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    salary: {
        type: Number,
        required: true
    },
    balans: {
        type: Number,
        required: false
    },
    password: {
        type: String,
        required: true
    },
    teachersId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    teacherType: {
        type: String
    },
    eduId: { type: String },
    groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }]
}, {
    timestamps: true
});

// Teacher modelini yaratish
const Teacher = mongoose.model('Teacher', teacherSchema);

// Teacher modelini eksport qilish
module.exports = Teacher;


