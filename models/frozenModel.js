const mongoose = require("mongoose");
let moment = require("moment");

let today = moment().format("DD.MM.YYYY");

const frozenSchema = new mongoose.Schema({
  studentId: mongoose.Schema.Types.ObjectId,
  groupId: { type: String },
  start: { type: String, default: today },
  end: { type: String, default: today },
});

const FrozenStudents = mongoose.model("FrozenStudents", frozenSchema);

module.exports = FrozenStudents;
