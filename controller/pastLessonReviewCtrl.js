const PastLessonReview = require('../models/pastLessonReviewSchema'); // Model fayl yo'lini sozlang

class PastLessonReviewController {
    // Yangi dars sharhini yaratish
    async createLessonReview(req, res) {
        try {
            const data = req.body;
            const lessonReview = new PastLessonReview(data);
            const savedReview = await lessonReview.save();
            return res.status(201).json({
                success: true,
                data: savedReview,
                message: 'Dars sharhi muvaffaqiyatli yaratildi'
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Barcha dars sharhlarini olish
    async getAllLessonReviews(req, res) {
        try {
            const lessonReviews = await PastLessonReview.find().sort({ createdAt: -1 });
            return res.status(200).json({
                success: true,
                data: lessonReviews,
                message: 'Dars sharhlari muvaffaqiyatli olindi'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // ID bo'yicha bitta dars sharhini olish
    async getLessonReviewById(req, res) {
        try {
            const lessonReview = await PastLessonReview.findById(req.params.id);
            if (!lessonReview) {
                return res.status(404).json({
                    success: false,
                    message: 'Dars sharhi topilmadi'
                });
            }
            return res.status(200).json({
                success: true,
                data: lessonReview,
                message: 'Dars sharhi muvaffaqiyatli olindi'
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // GroupaId bo'yicha dars sharhlarini olish
    async getByGroupaId(req, res) {
        try {
            const lessonReviews = await PastLessonReview.find({ groupaId: req.params.groupaId }).sort({ createdAt: -1 });
            if (!lessonReviews || lessonReviews.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Ushbu groupaId uchun dars sharhlari topilmadi'
                });
            }
            return res.status(200).json({
                success: true,
                data: lessonReviews,
                message: 'Dars sharhlari muvaffaqiyatli olindi'
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // GroupaId va createdAt bo'yicha dars sharhlarini olish
    async getByGroupaIdAndDate(req, res) {
        try {
            const { groupaId, startDate, endDate } = req.query;
            if (!groupaId || !startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    message: 'groupaId, startDate va endDate parametrlari talab qilinadi'
                });
            }

            const lessonReviews = await PastLessonReview.find({
                groupaId,
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            }).sort({ createdAt: -1 });

            if (!lessonReviews || lessonReviews.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Ushbu groupaId va sana oralig\'i uchun dars sharhlari topilmadi'
                });
            }

            return res.status(200).json({
                success: true,
                data: lessonReviews,
                message: 'Dars sharhlari muvaffaqiyatli olindi'
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Dars sharhini yangilash
    async updateLessonReview(req, res) {
        try {
            const lessonReview = await PastLessonReview.findByIdAndUpdate(
                req.params.id,
                { $set: req.body },
                { new: true, runValidators: true }
            );
            if (!lessonReview) {
                return res.status(404).json({
                    success: false,
                    message: 'Dars sharhi topilmadi'
                });
            }
            return res.status(200).json({
                success: true,
                data: lessonReview,
                message: 'Dars sharhi muvaffaqiyatli yangilandi'
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    // Dars sharhini o'chirish
    async deleteLessonReview(req, res) {
        try {
            const lessonReview = await PastLessonReview.findByIdAndDelete(req.params.id);
            if (!lessonReview) {
                return res.status(404).json({
                    success: false,
                    message: 'Dars sharhi topilmadi'
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Dars sharhi muvaffaqiyatli o\'chirildi'
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new PastLessonReviewController();