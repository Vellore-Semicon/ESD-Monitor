const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "CustomerUser" },
    masterDeviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MasterDevice",
    },
    DeviceID: Number,
    deviceName: String,
    Connected: String,
    Date: String,
    Time: String,
    MasterCode: String,
    Operator1: String,
    Operator2: String,
    Mat1: String,
    Mat2: String,
    Machine: String,
    isVisible: { type: Boolean, default: true },
    FetchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

logSchema.pre("save", function (next) {
  if (!this.deviceName && this.DeviceID != null) {
    this.deviceName = `DEV-${this.DeviceID}`;
  }
  next();
});

module.exports = mongoose.model("DeviceLog", logSchema);
