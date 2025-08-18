const mongoose = require("mongoose");

const masterDeviceSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "CustomerUser" },
  lineId: { type: mongoose.Schema.Types.ObjectId, ref: "Line" },
  isVisible: { type: Boolean, default: true },
  masterCode: { type: String },
  masterName: String,
  description: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("MasterDevice", masterDeviceSchema);
