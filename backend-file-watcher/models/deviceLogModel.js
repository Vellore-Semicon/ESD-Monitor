const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  DeviceID: Number,
  Connected: String,
  Date: String,
  Time: String,
  MasterCode: String,
  Operator1: String,
  Operator2: String,
  Mat1: String,
  Mat2: String,
  Machine: String,
  FetchedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("DeviceLog", logSchema);
