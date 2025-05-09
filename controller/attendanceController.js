const Attendance = require('../models/studentAttendance');

// Create or Update Attendance/Grades
exports.createOrUpdateAttendance = async (req, res) => {
    try {
        const { groupId, data } = req.body;

        if (!groupId || !Array.isArray(data) || data.length === 0) {
            return res.status(400).json({ message: 'Invalid request payload' });
        }

        const bulkOps = data.map((item) => {
            const { studentId, subjects, teacherId, attendance, grades } = item;
            const filter = { groupId, studentId, subjects, teacherId };
            const update = {};

            if (attendance && attendance.length > 0) {
                update.$push = { attendance: { $each: attendance } };
            }
            if (grades && grades.length > 0) {
                update.$push = update.$push || {};
                update.$push.grades = { $each: grades };
            }

            return {
                updateOne: {
                    filter,
                    update,
                    upsert: true,
                },
            };
        });

        await Attendance.bulkWrite(bulkOps);

        res.status(200).json({ message: 'Attendance/Grades saved successfully' });
    } catch (error) {
        console.error('Error saving attendance:', error);
        res.status(500).json({ message: 'Server error while saving attendance' });
    }
};

// Read Attendance/Grades by Group ID
exports.getAttendanceByGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const attendanceData = await Attendance.find({ groupId }).lean();

        res.status(200).json(attendanceData);
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ message: 'Server error while fetching attendance' });
    }
};

// Read Attendance/Grades by Group ID and Student ID
exports.getAttendanceByGroupAndStudent = async (req, res) => {
    try {
        const { groupId, studentId } = req.params;
        const attendanceData = await Attendance.findOne({ groupId, studentId }).lean();

        res.status(200).json(attendanceData);
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ message: 'Server error while fetching attendance' });
    }
};

// Update Specific Attendance/Grade
exports.updateAttendance = async (req, res) => {
    try {
        const { groupId, studentId, date, type, value } = req.body;

        if (!['attendance', 'grade'].includes(type) || !value) {
            return res.status(400).json({ message: 'Invalid type or value' });
        }

        const updateField = type === 'attendance' ? 'attendance' : 'grades';
        const update = {
            $set: {
                [`${updateField}.$[elem]`]: { date, [type]: value },
            },
        };
        const arrayFilters = [{ 'elem.date': date }];

        const result = await Attendance.updateOne(
            { groupId, studentId },
            update,
            { arrayFilters }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Record not found' });
        }

        res.status(200).json({ message: `${type === 'attendance' ? 'Attendance' : 'Grade'} updated successfully` });
    } catch (error) {
        console.error('Error updating attendance:', error);
        res.status(500).json({ message: 'Server error while updating attendance' });
    }
};

// Delete Attendance/Grade
exports.deleteAttendance = async (req, res) => {
    try {
        const { groupId, studentId, date, type } = req.body;

        if (!['attendance', 'grade'].includes(type)) {
            return res.status(400).json({ message: 'Invalid type' });
        }

        const updateField = type === 'attendance' ? 'attendance' : 'grades';
        const update = {
            $pull: {
                [updateField]: { date },
            },
        };

        const result = await Attendance.updateOne(
            { groupId, studentId },
            update
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Record not found' });
        }

        res.status(200).json({ message: `${type === 'attendance' ? 'Attendance' : 'Grade'} deleted successfully` });
    } catch (error) {
        console.error('Error deleting attendance:', error);
        res.status(500).json({ message: 'Server error while deleting attendance' });
    }
};