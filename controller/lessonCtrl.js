const LessonSchedule = require('../models/lessonSchema');
const Groups = require('../models/groups');

class LessonScheduleController {
    // Group CRUD Operations
    async createGroupLesson(req, res) {
        try {
            console.log(req.body);
            const group = new LessonSchedule(req.body);
            const savedGroup = await group.save();
            return res.status(201).json({
                success: true,
                data: savedGroup,
                message: 'Group created successfully'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: `Failed to create group: ${error.message}`
            });
        }
    }

    async getGroup(req, res) {
        try {
            const group = await LessonSchedule.findById(req.params.id);
            if (!group) {
                return res.status(404).json({
                    success: false,
                    error: 'Group not found'
                });
            }
            return res.status(200).json({
                success: true,
                data: group
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: `Failed to get group: ${error.message}`
            });
        }
    }

    async getAllGroups(req, res) {
        try {
            const groups = await LessonSchedule.find();
            return res.status(200).json({
                success: true,
                data: groups
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: `Failed to get groups: ${error.message}`
            });
        }
    }

    async updateGroup(req, res) {
        try {
            const group = await LessonSchedule.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );
            if (!group) {
                return res.status(404).json({
                    success: false,
                    error: 'Group not found'
                });
            }
            return res.status(200).json({
                success: true,
                data: group,
                message: 'Group updated successfully'
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: `Failed to update group: ${error.message}`
            });
        }
    }

    async deleteGroup(req, res) {
        try {
            const group = await LessonSchedule.findByIdAndDelete(req.params.id);
            if (!group) {
                return res.status(404).json({
                    success: false,
                    error: 'Group not found'
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Group deleted successfully'
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: `Failed to delete group: ${error.message}`
            });
        }
    }

    // GroupaIds Management
    // async addGroupaId(req, res) {
    //     try {
    //         const group = await LessonSchedule.findById(req.params.id);
    //         if (!group) {
    //             return res.status(404).json({
    //                 success: false,
    //                 error: 'Group not found'
    //             });
    //         }

    //         const { groupaId } = req.body;
    //         if (group.groupaIds.includes(groupaId)) {
    //             return res.status(400).json({
    //                 success: false,
    //                 error: 'GroupaId already exists'
    //             });
    //         }

    //         if (group.groupaIds.length >= 5) {
    //             return res.status(400).json({
    //                 success: false,
    //                 error: 'Cannot add more than 5 groupaIds'
    //             });
    //         }

    //         group.groupaIds.push(groupaId);
    //         const updatedGroup = await group.save();
    //         return res.status(200).json({
    //             success: true,
    //             data: updatedGroup,
    //             message: 'GroupaId added successfully'
    //         });
    //     } catch (error) {
    //         return res.status(400).json({
    //             success: false,
    //             error: `Failed to add groupaId: ${error.message}`
    //         });
    //     }
    // }
    async addGroupaId(req, res) {
        try {
            const { groupaId } = req.body;
            const lesson = await LessonSchedule.findById(req.params.id);
            const group = await Groups.findById(groupaId);

            // Validate LessonSchedule document
            if (!lesson) {
                return res.status(404).json({
                    success: false,
                    error: 'Lesson schedule not found'
                });
            }

            // Validate Groups document
            if (!group) {
                return res.status(404).json({
                    success: false,
                    error: 'Group not found'
                });
            }

            // Check if groupaIds length is already at max (5)
            if (lesson.groupaIds.length >= 5 && !lesson.groupaIds.includes(groupaId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Cannot add more than 5 groupaIds'
                });
            }

            // Remove groupaId from all LessonSchedule documents if it exists
            await LessonSchedule.updateMany(
                { groupaIds: groupaId },
                { $pull: { groupaIds: groupaId } }
            );

            // Add groupaId to the target lesson if not already present
            if (!lesson.groupaIds.includes(groupaId)) {
                lesson.groupaIds.push(groupaId);
                await lesson.save();
            }

            // Update group's level and step to match lesson's values
            group.level = lesson.level || group.level || 'beginner';
            group.step = lesson.step || group.step || 1;

            // Validate step value (min: 1, max: 10 as per schema)
            if (group.step < 1 || group.step > 10) {
                return res.status(400).json({
                    success: false,
                    error: 'Step must be between 1 and 10'
                });
            }

            // Validate level value (enum: ['beginner', 'intermediate', 'advanced'])
            if (group.level && !['beginner', 'intermediate', 'advanced'].includes(group.level)) {
                return res.status(400).json({
                    success: false,
                    error: 'Level must be one of: beginner, intermediate, advanced'
                });
            }

            // Save updated group
            await group.save();

            return res.status(200).json({
                success: true,
                data: {
                    lesson,
                    group
                },
                message: 'GroupaId processed and group updated successfully'
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: `Failed to process groupaId: ${error.message}`
            });
        }
    }

    async removeGroupaId(req, res) {
        try {
            const group = await LessonSchedule.findById(req.params.id);
            if (!group) {
                return res.status(404).json({
                    success: false,
                    error: 'Group not found'
                });
            }

            const { groupaId } = req.body;
            if (group.groupaIds.length <= 4) {
                return res.status(400).json({
                    success: false,
                    error: 'Cannot remove groupaId: minimum 4 required'
                });
            }

            group.groupaIds = group.groupaIds.filter(id => id !== groupaId);
            const updatedGroup = await group.save();
            return res.status(200).json({
                success: true,
                data: updatedGroup,
                message: 'GroupaId removed successfully'
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: `Failed to remove groupaId: ${error.message}`
            });
        }
    }

    // Lesson CRUD Operations
    async createLesson(req, res) {
        try {
            const group = await LessonSchedule.findById(req.params.id);
            if (!group) {
                return res.status(404).json({
                    success: false,
                    error: 'Group not found'
                });
            }

            group.lessons.push(req.body);
            const updatedGroup = await group.save();
            return res.status(201).json({
                success: true,
                data: updatedGroup,
                message: 'Lesson created successfully'
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: `Failed to create lesson: ${error.message}`
            });
        }
    }

    async updateLesson(req, res) {
        try {
            const group = await LessonSchedule.findById(req.params.id);
            if (!group) {
                return res.status(404).json({
                    success: false,
                    error: 'Group not found'
                });
            }

            const lesson = group.lessons.id(req.params.lessonId);
            if (!lesson) {
                return res.status(404).json({
                    success: false,
                    error: 'Lesson not found'
                });
            }

            lesson.set(req.body);
            const updatedGroup = await group.save();
            return res.status(200).json({
                success: true,
                data: updatedGroup,
                message: 'Lesson updated successfully'
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: `Failed to update lesson: ${error.message}`
            });
        }
    }

    async deleteLesson(req, res) {
        try {
            const group = await LessonSchedule.findById(req.params.id);
            if (!group) {
                return res.status(404).json({
                    success: false,
                    error: 'Group not found'
                });
            }

            group.lessons.pull(req.params.lessonId);
            const updatedGroup = await group.save();
            return res.status(200).json({
                success: true,
                data: updatedGroup,
                message: 'Lesson deleted successfully'
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: `Failed to delete lesson: ${error.message}`
            });
        }
    }
};

module.exports = new LessonScheduleController();