const Groups = require('../models/groups');
const Student = require('../models/student');

// Get all registrations
const getAllRegistrations = async (req, res) => {
    try {
        const groups = await Groups.find(); // Barcha guruhlarni olish
        const registrations = await Promise.all(groups?.map(async (group) => {
            const studentsCount = await Student.countDocuments({ groupId: group._id }); // Har bir guruhga tegishli o'quvchilar sonini olish
            return {
                ...group._doc, // Group obyekti ichidagi barcha maydonlarni qo'shish
                students: studentsCount // O'quvchilar sonini qo'shish
            };
        }));

        res.status(200).json({
            message: 'All registrations retrieved successfully',
            registrations // Endi bu faqat group array formatida qaytariladi
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Create a new registration
const createRegistration = async (req, res) => {
    try {
        const newRegistration = new Groups(req.body);
        await newRegistration.save();
        res.status(201).json(newRegistration);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


const getGroupsByTeacher = async (req, res) => {
    try {
        const { id: teacherId } = req.params;
        console.log(teacherId);
        // Query for teacherId as a stringified array
        const groups = await Groups.find({ teacherId: `["${teacherId}"]` }).lean();
        return res.json(groups);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching groups', error: error.message });
    }
};

// Get a single registration
const getRegistration = async (req, res) => {
    try {
        const registration = await Groups.findById(req.params.id);
        if (!registration) return res.status(404).json({ message: 'Registration not found' });
        res.status(200).json(registration);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a registration
const updateRegistration = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        // Guruhni yangilash va yangilangan holatda olish
        const updatedGroup = await Groups.findByIdAndUpdate(id, updates);

        // Agar guruh topilmasa
        if (!updatedGroup) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // Muvaffaqiyatli javob
        res.status(200).json({
            message: 'Registration updated successfully',
            data: updatedGroup,
            success: true,
        });
    } catch (error) {
        console.error('Error updating registration:', error);
        res.status(500).json({
            message: 'Failed to update registration',
            error: error.message,
        });
    }
};

// Delete a registration
const deleteRegistration = async (req, res) => {
    try {
        const registration = await Groups.findByIdAndDelete(req.params.id);
        if (!registration) return res.status(404).json({ message: 'Registration not found' });
        res.status(200).json({ message: 'Registration deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update teacherId and teachers in a group
const updateTeachers = async (req, res) => {
    const { teacherId, teachers } = req.body;

    try {
        // Check if the user is an admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied: Admins only' });
        }

        // Find the group by ID
        const group = await Groups.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if teacherId or teachers fields need updating
        const isTeacherIdChanged = teacherId && JSON.stringify(group.teacherId) !== JSON.stringify(teacherId);
        const isTeachersChanged = teachers && JSON.stringify(group.teachers) !== JSON.stringify(teachers);

        if (isTeacherIdChanged || isTeachersChanged) {
            if (isTeacherIdChanged) {
                group.teacherId = teacherId;
            }
            if (isTeachersChanged) {
                group.teachers = teachers;
            }

            // Save the updated group
            await group.save();
            return res.json({ message: 'Teacher and teachers updated successfully', group });
        } else {
            return res.status(200).json({ message: 'No changes detected', group });
        }
    } catch (error) {
        console.error('Error updating teacher and teachers:', error);
        return res.status(500).json({ message: 'Error updating teacher and teachers', error });
    }
};

module.exports = {
    createRegistration,
    getRegistration,
    deleteRegistration,
    getAllRegistrations,
    updateTeachers,
    updateRegistration,
    getGroupsByTeacher,
};
