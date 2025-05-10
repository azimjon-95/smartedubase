const Attendance = require('../models/studentAttendance'); // Attendance model
const Student = require('../models/student'); // Adjust path to your Student model

// O‘quvchi QR skaner orqali keldi deb belgilash funksiyasi
const markAttendance = async (req, res) => {
    try {
        const { studentId } = req.body; // studentId ni body dan olish

        // studentId mavjudligini tekshirish
        if (!studentId) {
            return res.status(400).json({ success: false, message: 'studentId kerak' });
        }

        // Bugungi sanani DD.MM.YYYY formatida olish
        const today = new Date();
        const formattedDate = `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1).toString().padStart(2, '0')}.${today.getFullYear()}`;

        // O‘quvchi ma’lumotlarini topish
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'O‘quvchi topilmadi' });
        }

        // Attendance ma’lumotlarini topish yoki yangisini yaratish
        let attendanceRecord = await Attendance.findOne({
            studentId: studentId,
            groupId: student.groupId,
            teacherId: student.teacherId,
            subjects: student.subject.join(', '), // subject array bo‘lsa, stringga aylantirish
        });

        if (!attendanceRecord) {
            // Agar davomat yozuvi mavjud bo‘lmasa, yangisini yaratish
            attendanceRecord = new Attendance({
                groupId: student.groupId,
                studentId: studentId,
                teacherId: student.teacherId,
                subjects: student.subject.join(', '),
                attendance: [{ date: formattedDate, attendance: 'A' }],
                grades: [],
            });
        } else {
            // Mavjud yozuvda bugungi sana borligini tekshirish
            const existingAttendance = attendanceRecord.attendance.find(
                (entry) => entry.date === formattedDate
            );

            if (existingAttendance) {
                // Agar bugungi sana uchun yozuv mavjud bo‘lsa, yangilash
                existingAttendance.attendance = 'A';
            } else {
                // Yangi davomat qo‘shish
                attendanceRecord.attendance.push({ date: formattedDate, attendance: 'A' });
            }
        }

        // Ma’lumotlarni saqlash
        await attendanceRecord.save();

        // Muvaffaqiyatli javob
        res.status(200).json({
            success: true,
            message: `O‘quvchi ${student.firstName} ${student.lastName} uchun davomat qilindi: ${formattedDate} - 'A'`,
        });
    } catch (error) {
        console.error('Davomat qilishda xatolik:', error.message);
        res.status(500).json({ success: false, message: 'Server xatosi: ' + error.message });
    }
}

module.exports = { markAttendance };