const Attendance = require('../models/studentAttendance');

// // Create or Update Attendance/Grades
// exports.createOrUpdateAttendance = async (req, res) => {
//     try {
//         const { groupId, data } = req.body;

//         // Validate input
//         if (!groupId || !Array.isArray(data) || data.length === 0) {
//             return res.status(400).json({
//                 message: 'Invalid request: groupId and non-empty data array are required',
//             });
//         }

//         // Prepare bulk operations
//         const bulkOps = data.map((item, itemIndex) => {
//             let { studentId, subjects, teacherId, attendance, grades } = item;

//             // Validate item
//             if (!studentId || !subjects || !teacherId || (!attendance && !grades)) {
//                 throw new Error(
//                     `Invalid data at index ${itemIndex}: each item must include studentId, subjects, teacherId, and at least one of attendance or grades`
//                 );
//             }

//             // Normalize subjects (convert array to string if needed)
//             if (Array.isArray(subjects)) {
//                 subjects = subjects[0]; // Take first subject
//             }

//             // Normalize teacherId (parse JSON string if needed)
//             if (typeof teacherId === 'string' && teacherId.startsWith('[')) {
//                 try {
//                     teacherId = JSON.parse(teacherId)[0]; // Take first ID
//                 } catch (e) {
//                     throw new Error(`Invalid teacherId format at index ${itemIndex}`);
//                 }
//             }

//             const filter = { groupId, studentId, subjects, teacherId };

//             // Handle attendance
//             const operations = [];
//             if (attendance?.length) {
//                 attendance.forEach((att, index) => {
//                     const { date, attendance: status } = att;
//                     if (!date || !['A', 'X'].includes(status)) {
//                         throw new Error(
//                             `Invalid attendance data at index ${itemIndex}.${index}: date and valid status (A or X) required`
//                         );
//                     }

//                     // Operation 1: Try to update existing attendance for the date
//                     operations.push({
//                         updateOne: {
//                             filter: { ...filter, 'attendance.date': date },
//                             update: {
//                                 $set: { 'attendance.$.attendance': status },
//                             },
//                         },
//                     });

//                     // Operation 2: If no match, push new attendance (conditional in bulkWrite)
//                     operations.push({
//                         updateOne: {
//                             filter: { ...filter, 'attendance.date': { $ne: date } },
//                             update: {
//                                 $push: { attendance: { date, attendance: status } },
//                             },
//                             upsert: true,
//                         },
//                     });
//                 });
//             }

//             // Handle grades
//             if (grades?.length) {
//                 grades.forEach((gr, index) => {
//                     const { date, grade } = gr;
//                     if (!date || !['2', '3', '4', '5', 'X'].includes(grade)) {
//                         throw new Error(
//                             `Invalid grade data at index ${itemIndex}.${index}: date and valid grade (2, 3, 4, 5, or X) required`
//                         );
//                     }

//                     // Operation 1: Try to update existing grade for the date
//                     operations.push({
//                         updateOne: {
//                             filter: { ...filter, 'grades.date': date },
//                             update: {
//                                 $set: { 'grades.$.grade': grade },
//                             },
//                         },
//                     });

//                     // Operation 2: If no match, push new grade
//                     operations.push({
//                         updateOne: {
//                             filter: { ...filter, 'grades.date': { $ne: date } },
//                             update: {
//                                 $push: { grades: { date, grade } },
//                             },
//                             upsert: true,
//                         },
//                     });
//                 });
//             }

//             return operations;
//         }).flat(); // Flatten the array of operations

//         // Execute bulk write
//         await Attendance.bulkWrite(bulkOps);

//         res.status(200).json({ message: 'Attendance/Grades saved successfully' });
//     } catch (error) {
//         console.error('Error saving attendance:', error);
//         res.status(500).json({ message: 'Server error while saving attendance' });
//     }
// };
// Create or Update Attendance/Grades
exports.createOrUpdateAttendance = async (req, res) => {
    try {
        const { groupId, data } = req.body;

        // Validate input
        if (!groupId || !Array.isArray(data) || data.length === 0) {
            return res.status(400).json({
                message: 'Invalid request: groupId and non-empty data array are required',
            });
        }

        // Prepare bulk operations
        const bulkOps = data.map((item, itemIndex) => {
            let { studentId, subjects, teacherId, attendance, grades } = item;

            // Validate item
            if (!studentId || !subjects || !teacherId || (!attendance && !grades)) {
                throw new Error(
                    `Invalid data at index ${itemIndex}: each item must include studentId, subjects, teacherId, and at least one of attendance or grades`
                );
            }

            // Normalize subjects (convert array to string if needed)
            if (Array.isArray(subjects)) {
                subjects = subjects[0]; // Take first subject
            }

            // Normalize teacherId (parse JSON string if needed)
            if (typeof teacherId === 'string' && teacherId.startsWith('[')) {
                try {
                    teacherId = JSON.parse(teacherId)[0]; // Take first ID
                } catch (e) {
                    throw new Error(`Invalid teacherId format at index ${itemIndex}`);
                }
            }

            const filter = { groupId, studentId, subjects, teacherId };

            // Handle attendance
            const operations = [];
            if (attendance?.length) {
                attendance.forEach((att, index) => {
                    const { date, attendance: status } = att;
                    if (!date) {
                        throw new Error(
                            `Invalid attendance data at index ${itemIndex}.${index}: date is required`
                        );
                    }

                    if (status === '') {
                        // Delete attendance entry for this date
                        operations.push({
                            updateOne: {
                                filter,
                                update: {
                                    $pull: { attendance: { date } },
                                },
                            },
                        });
                    } else if (['A', 'X'].includes(status)) {
                        // Operation 1: Try to update existing attendance for the date
                        operations.push({
                            updateOne: {
                                filter: { ...filter, 'attendance.date': date },
                                update: {
                                    $set: { 'attendance.$.attendance': status },
                                },
                            },
                        });

                        // Operation 2: If no match, push new attendance
                        operations.push({
                            updateOne: {
                                filter: { ...filter, 'attendance.date': { $ne: date } },
                                update: {
                                    $push: { attendance: { date, attendance: status } },
                                },
                                upsert: true,
                            },
                        });
                    } else {
                        throw new Error(
                            `Invalid attendance data at index ${itemIndex}.${index}: status must be 'A', 'X', or empty string`
                        );
                    }
                });
            }

            // Handle grades
            if (grades?.length) {
                grades.forEach((gr, index) => {
                    const { date, grade } = gr;
                    if (!date) {
                        throw new Error(
                            `Invalid grade data at index ${itemIndex}.${index}: date is required`
                        );
                    }

                    if (grade === '') {
                        // Delete grade entry for this date
                        operations.push({
                            updateOne: {
                                filter,
                                update: {
                                    $pull: { grades: { date } },
                                },
                            },
                        });
                    } else if (['2', '3', '4', '5', 'X'].includes(grade)) {
                        // Operation 1: Try to update existing grade for the date
                        operations.push({
                            updateOne: {
                                filter: { ...filter, 'grades.date': date },
                                update: {
                                    $set: { 'grades.$.grade': grade },
                                },
                            },
                        });

                        // Operation 2: If no match, push new grade
                        operations.push({
                            updateOne: {
                                filter: { ...filter, 'grades.date': { $ne: date } },
                                update: {
                                    $push: { grades: { date, grade } },
                                },
                                upsert: true,
                            },
                        });
                    } else {
                        throw new Error(
                            `Invalid grade data at index ${itemIndex}.${index}: grade must be '2', '3', '4', '5', 'X', or empty string`
                        );
                    }
                });
            }

            return operations;
        }).flat(); // Flatten the array of operations

        // Execute bulk write
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