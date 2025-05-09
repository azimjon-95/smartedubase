const express = require('express');
const teacher = express.Router();
const teacherController = require('../controller/teacherCtrl'); // Controllerni import qilish

// Barcha ustozlarni olish
teacher.get('/teacher', teacherController.getAllTeachers);

// Bir ustozni olish
teacher.get('/teacher/:id', teacherController.getTeacherById);

// Yangi ustoz yaratish
teacher.post('/teacher', teacherController.createTeacher);

// Ustozni yangilash
teacher.put('/teacher/:id', teacherController.updateTeacher);

// Ustozni o'chirish
teacher.delete('/teacher/:id', teacherController.deleteTeacher);

// Foydalanuvchi tizimga kirishi
teacher.post('/teacher/signin', teacherController.signIn);


module.exports = teacher;
