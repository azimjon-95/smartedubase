const express = require("express");
const studentRouter = express.Router();
const {
  deleteStudent,
  updateStudent,
  createStudent,
  getStudent,
  updateStudentState,
  getStudentById,
  getDailyStudentStats,
  handleTransferRequest
} = require("../controller/studentsCtrl");

studentRouter.get("/studentStats", getDailyStudentStats); // GET /students
studentRouter.get("/student/", getStudent); // GET /students
studentRouter.post("/student/", createStudent); // POST /students
studentRouter.post("/student/change/", handleTransferRequest); // POST /students
studentRouter.put("/student/:id", updateStudent); // PUT /students/:id
studentRouter.get("/student/:id", getStudentById); // PUT /students/:id
studentRouter.delete("/student/:id", deleteStudent); // DELETE /students/:id
studentRouter.put("/student/update-state/:groupId", updateStudentState);

// export
module.exports = studentRouter;
