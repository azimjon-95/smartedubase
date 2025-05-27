const express = require('express');
const router = express.Router();
const lessonScheduleController = require('../controller/lessonCtrl');
const lessonReviewController = require('../controller/pastLessonReviewCtrl');

// ===============================================
// Group CRUD Routes
router.post('/lessons', lessonScheduleController.createGroupLesson);
router.get('/lesson/:id', lessonScheduleController.getGroup);
router.get('/lesson', lessonScheduleController.getAllGroups);
router.put('/lesson/:id', lessonScheduleController.updateGroup);
router.delete('/lesson/:id', lessonScheduleController.deleteGroup);

// GroupaId Management Routes
router.put('/lesson/:id/add-groupa-id', lessonScheduleController.addGroupaId);
router.put('/lesson/:id/remove-groupa-id', lessonScheduleController.removeGroupaId);

// Lesson CRUD Routes
router.post('/lesson/:id/lessons', lessonScheduleController.createLesson);
router.put('/lesson/:id/lessons/:lessonId', lessonScheduleController.updateLesson);
router.delete('/lesson/:id/lessons/:lessonId', lessonScheduleController.deleteLesson);


// ===============================================
// Marshrutlar
router.post('/lessonReview', lessonReviewController.createLessonReview);
router.get('/lessonReview', lessonReviewController.getAllLessonReviews);
router.get('/lessonReview/:id', lessonReviewController.getLessonReviewById);
router.put('/lessonReview/:id', lessonReviewController.updateLessonReview);
router.delete('/lessonReview/:id', lessonReviewController.deleteLessonReview);
router.get('/lessonReview/groupaId/:groupaId', lessonReviewController.getByGroupaId);
router.get('/lessonReview/group-date', lessonReviewController.getByGroupaIdAndDate);


module.exports = router;