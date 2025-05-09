const Student = require("../models/student"); // Adjust the path as per your structure
const Groups = require("../models/groups"); // Adjust the path as per your structure
const mongoose = require("mongoose");


// READ
const getStudent = async (req, res) => {
  try {
    const student = await Student.find();
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Helper function to get start and end of a day
const getDayBoundaries = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// Helper function to calculate percentage based on historical trend
const calculatePercentage = (todayCount, historicalData) => {
  if (!historicalData.length) {
    return todayCount > 0 ? 100 : 0;
  }

  // Calculate average historical registrations
  const totalHistorical = historicalData.reduce((sum, day) => sum + day.count, 0);
  const averageHistorical = totalHistorical / historicalData.length;

  // If no historical registrations, handle edge case
  if (averageHistorical === 0) {
    return todayCount > 0 ? 100 : 0;
  }

  // Calculate percentage change relative to historical average
  const change = ((todayCount - averageHistorical) / averageHistorical) * 100;

  // Normalize to 0-100 range
  if (change > 100) return 100;
  if (change < -100) return 0;

  // Convert to positive scale (0-100) with decimal precision
  const percentage = 50 + (change / 2);
  // Return with 2 decimal places
  return Number(percentage.toFixed(2));
};

// Main function to get daily statistics with percentage based on all historical data
const getDailyStudentStats = async (req, res) => {
  try {
    // Get current date
    const today = new Date();
    const todayBounds = getDayBoundaries(today);

    // Get all registrations grouped by day (excluding today)
    const historicalData = await Student.aggregate([
      {
        $match: {
          createdAt: { $lt: todayBounds.start }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          date: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    // Count students registered today
    const todayCount = await Student.countDocuments({
      createdAt: {
        $gte: todayBounds.start,
        $lte: todayBounds.end
      }
    });

    // Calculate percentage based on historical data
    const percentage = calculatePercentage(todayCount, historicalData);

    // Calculate trend (compare to historical average)
    const historicalAverage = historicalData.length
      ? historicalData.reduce((sum, day) => sum + day.count, 0) / historicalData.length
      : 0;

    // Prepare response
    const stats = {
      date: today.toISOString().split('T')[0],
      todayRegistrations: todayCount,
      historicalAverage: Number(historicalAverage.toFixed(2)),
      historicalDays: historicalData.length,
      percentage: percentage,
      trend: todayCount > historicalAverage ? 'up' :
        todayCount < historicalAverage ? 'down' : 'stable',
      historicalData: historicalData // Optional: include full historical data
    };

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// get by id 
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE
const createStudent = async (req, res) => {
  try {
    const newRegistration = new Student(req.body);
    await newRegistration.save();
    res.status(201).json(newRegistration);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// UPDATE
const updateStudent = async (req, res) => {
  let result = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!result) {
    return res.status(404).send("Student not found")
  }
  res.status(200).json(result)

};

// DELETE
const deleteStudent = (req, res) => {
  Student.findByIdAndDelete(req.params.id)
    .then(() => res.send("Student deleted successfully"))
    .catch((err) => res.status(400).json("Error: " + err));
};



// =============================================


// Helper function to get total days in a month
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// Helper function to count odd or even days in a month
function getSpecificDaysInMonth(year, month, type) {
  const daysInMonth = getDaysInMonth(year, month);
  let count = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    if (type === "oddDays" && day % 2 !== 0) count++;
    if (type === "evenDays" && day % 2 === 0) count++;
  }
  return count;
}

// Helper function to count non-Sunday days in a month (for allDays)
function getNonSundayDaysInMonth(year, month) {
  const daysInMonth = getDaysInMonth(year, month);
  let count = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    if (date.getDay() !== 0) count++; // Exclude Sunday (0)
  }
  return count;
}

// Helper function to count remaining odd, even, or non-Sunday days
function getRemainingDays(startDate, schedule) {
  const year = startDate.getFullYear();
  const month = startDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  let count = 0;
  for (let day = startDate.getDate(); day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    if (schedule === "oddDays" && day % 2 !== 0) count++;
    if (schedule === "evenDays" && day % 2 === 0) count++;
    if (schedule === "allDays" && date.getDay() !== 0) count++;
  }
  return count;
}

async function updateStudentState(req, res) {
  try {
    const { groupId } = req.params; // Extract groupId from request parameters

    // Find the group to get schedule and monthlyPay
    const group = await Groups.findById(groupId);
    if (!group) {
      return res.status(404).send("Group not found");
    }

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const formattedDate = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD

    let debtorPay = 0;
    let totalLessonDays = 0;

    // Calculate total and remaining lesson days based on schedule
    if (group.schedule === "oddDays") {
      totalLessonDays = getSpecificDaysInMonth(year, month, "oddDays");
      const remainingOddDays = getRemainingDays(currentDate, "oddDays");
      const perLessonCost = group.mothlyPay / totalLessonDays;
      debtorPay = Math.round(perLessonCost * remainingOddDays);
    } else if (group.schedule === "evenDays") {
      totalLessonDays = getSpecificDaysInMonth(year, month, "evenDays");
      const remainingEvenDays = getRemainingDays(currentDate, "evenDays");
      const perLessonCost = group.mothlyPay / totalLessonDays;
      debtorPay = Math.round(perLessonCost * remainingEvenDays);
    } else if (group.schedule === "allDays") {
      totalLessonDays = getNonSundayDaysInMonth(year, month);
      const remainingNonSundayDays = getRemainingDays(currentDate, "allDays");
      const perLessonCost = group.mothlyPay / totalLessonDays;
      debtorPay = Math.round(perLessonCost * remainingNonSundayDays);
    } else {
      return res.status(400).send("Invalid schedule type");
    }

    // Update students in the group with state "new" to "active" and set indebtedness
    const result = await Student.updateMany(
      { groupId: groupId, state: "new" },
      {
        $set: {
          state: "active",
          indebtedness: {
            debtorDate: formattedDate,
            debtorPay: debtorPay
          }
        }
      }
    );

    res.status(200).send({
      message: "Students updated successfully",
      updatedCount: result.modifiedCount,
      success: true
    });
  } catch (error) {
    console.error('Error updating students:', error);
    res.status(500).send("Internal server error");
  }
}















// Function to transfer student to another group
async function transferStudentToGroup(studentId, newGroupId) {
  try {
    // Start a session for atomic transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find the student
      const student = await Student.findById(studentId).session(session);
      if (!student) {
        throw new Error('Student not found');
      }

      // Find the new group
      const newGroup = await Groups.findById(newGroupId).session(session);
      if (!newGroup) {
        throw new Error('Group not found');
      }

      // Find the old group to update student count
      const oldGroup = await Groups.findById(student.groupId).session(session);

      // Update student details
      student.groupId = newGroupId;
      student.teacherId = newGroup.teacherId;
      student.teacherFullName = newGroup.teachers;
      student.subject = newGroup.subjects;
      student.lessonTime = newGroup.lessonTime;
      student.payForLesson = newGroup.mothlyPay;

      // Update group student counts
      if (oldGroup) {
        oldGroup.studentsLength = Math.max(0, oldGroup.studentsLength - 1);
        await oldGroup.save({ session });
      }

      newGroup.studentsLength = (newGroup.studentsLength || 0) + 1;
      await newGroup.save({ session });

      // Save student changes
      await student.save({ session });

      // Commit transaction
      await session.commitTransaction();
      return {
        message: 'Student transferred successfully',
        student,
        newGroup
      };
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    throw new Error(`Transfer failed: ${error.message}`);
  }
}

// API handler for transferring student
async function handleTransferRequest(req, res) {
  const { studentId, newGroupId } = req.body;


  if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(newGroupId)) {
    return res.status(400).json({ error: 'Invalid studentId or groupId' });
  }

  try {
    const result = await transferStudentToGroup(studentId, newGroupId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
module.exports = {
  deleteStudent,
  updateStudent,
  createStudent,
  getStudent,
  updateStudentState,
  getStudentById,
  getDailyStudentStats,
  handleTransferRequest
};
