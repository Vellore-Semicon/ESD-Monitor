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
    Date: String, // Format: YYYY-MM-DD
    Time: String, // Format: HH:MM:SS
    MasterCode: String,
    shift: [
      {
        ShiftName: String,
        StartTime: String, // Format: HH:MM:SS
        EndTime: String, // Format: HH:MM:SS
        Operator1Name: String,
        Operator2Name: String,
      },
    ],
    Operator1: String,
    Operator2: String,
    Mat1: String,
    Mat2: String,
    Machine: String,
    isVisible: { type: Boolean, default: true },
    FetchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

logSchema.pre("save", function (next) {
  if (!this.deviceName && this.DeviceID != null) {
    this.deviceName = `DEV-${this.DeviceID}`;
  }

  const now = new Date();

  if (!this.Date) {
    this.Date = now.toISOString().split("T")[0]; // YYYY-MM-DD
  }

  if (!this.Time) {
    this.Time = now.toTimeString().split(" ")[0]; // HH:MM:SS
  }

  next();
});

module.exports = mongoose.model("DeviceLog", logSchema);
