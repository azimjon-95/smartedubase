const Teacher = require('../models/teacher'); // Teacher modelini import qilish
const jwt = require('jsonwebtoken');

// Barcha ustozlarni olish
exports.getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Bir ustozni olish
exports.getTeacherById = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) return res.status(404).json({ message: 'Ustoz topilmadi' });
        res.json(teacher);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Ustoz yaratish
exports.createTeacher = async (req, res) => {
    try {
        const { teachersId, username } = req.body;

        // Bir vaqtning o'zida ID va username bor-yo‘qligini tekshirish
        const [existingId, existingUsername] = await Promise.all([
            Teacher.findOne({ teachersId }),
            Teacher.findOne({ username }),
        ]);

        if (existingId) {
            return res.status(400).json({ message: 'Ushbu ID raqam bilan ustoz allaqachon mavjud.' });
        }

        if (existingUsername) {
            return res.status(400).json({ message: 'Ushbu login (username) bilan ustoz allaqachon mavjud.' });
        }

        const newTeacher = await Teacher.create(req.body);

        return res.status(201).json({
            message: 'O‘qituvchi muvaffaqiyatli ro‘yxatdan o‘tdi',
            teacher: newTeacher
        });
    } catch (err) {
        console.error('Xatolik:', err);

        // Validation xatoliklari
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ message: `Ma'lumotlar noto‘g‘ri: ${errors.join(', ')}` });
        }

        // MongoDB unikal constraint xatoliklari
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json({ message: `Ushbu ${field} allaqachon mavjud.` });
        }

        // Boshqa noma’lum xatoliklar
        return res.status(500).json({ message: 'Ichki server xatoligi yuz berdi.' });
    }
};


// Ustozni yangilash
exports.updateTeacher = async (req, res) => {
    try {
        const updatedTeacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedTeacher) return res.status(404).json({ message: 'Ustoz topilmadi' });
        res.json(updatedTeacher);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Ustozni o'chirish
exports.deleteTeacher = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedTeacher = await Teacher.findByIdAndDelete({ _id: id });
        if (!deletedTeacher) {
            return res.status(404).json({ message: 'Ustoz topilmadi' });
        }
        res.json({ message: 'Ustoz o\'chirildi' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// SignIn (kirish) funksiyasi
const secretKey = process.env.JWT_SECRET_KEY; // .env fayldan maxfiy kalitni o'qish

exports.signIn = async (req, res) => {
    try {
        const { username } = req.body;
        const teacher = await Teacher.findOne({ username });
        if (!teacher) {
            return res.status(400).json({ message: 'Foydalanuvchi nomi yoki parol xato' });
        }

        // Token yaratish
        const token = jwt.sign({ id: teacher._id }, secretKey, { expiresIn: '30d' });

        res.json({
            message: 'Muvaffaqiyatli kirish',
            token,
            teacher
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
