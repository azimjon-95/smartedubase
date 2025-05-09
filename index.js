const express = require("express");
require("dotenv").config();
const students = require('./routes/students');
const groups = require('./routes/groups');
const teacher = require('./routes/teacher');
const attendanceRoutes = require('./routes/attendance.routes');
const payStudentStoryRoutes = require('./routes/payStudentStoryRoutes');
const balansRoutes = require('./routes/balansRoutes');
const qrRoutes = require('./routes/qrRoutes');
const fileUpload = require('express-fileupload');




const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
app.use(fileUpload());

const DATABASE = () => {
  // Using .catch()
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("MongoDB connected successfully");
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err);
    });
};
DATABASE();

// Register route
app.get("/", (req, res) => {
  res.send("Welcome to my API");
});

app.use("/api", students);
app.use("/api", groups);
app.use("/api", teacher);
app.use("/balans", balansRoutes);
app.use("/api", attendanceRoutes);
app.use("/api/payments", payStudentStoryRoutes);
app.use("/api", qrRoutes);



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


