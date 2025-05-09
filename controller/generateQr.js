const QRCode = require('qrcode');
const { createCanvas, loadImage } = require('canvas');
const Student = require('../models/student'); // Adjust path to your Student model
const Attendance = require('../models/studentAttendance'); // Attendance model


// Route to generate and download QR code
const generateQr = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Find student by ID
        const student = await Student.findById(studentId).select('firstName lastName');
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // QR code content (e.g., student ID)
        const qrContent = studentId;

        // Create canvas for QR code and text
        const canvas = createCanvas(300, 350); // 300x350 to accommodate QR code and text
        const ctx = canvas.getContext('2d');

        // Generate QR code
        const qrDataUrl = await QRCode.toDataURL(qrContent, {
            width: 250,
            margin: 1,
        });

        // Load QR code image
        const qrImage = await loadImage(qrDataUrl);

        // Draw QR code on canvas (centered)
        ctx.drawImage(qrImage, 25, 10, 250, 250);

        // Add student's full name below QR code
        const fullName = `${student.firstName} ${student.lastName}`;
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText(fullName, 150, 290);

        // Convert canvas to buffer
        const buffer = canvas.toBuffer('image/png');

        // Set headers for automatic download
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename=qr_${studentId}.png`);

        // Send the image
        res.send(buffer);

    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

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

module.exports = { generateQr, markAttendance };