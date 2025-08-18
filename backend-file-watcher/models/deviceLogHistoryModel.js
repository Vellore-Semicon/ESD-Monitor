const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "CustomerUser" },
    masterDeviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MasterDevice",
      default: null,
    },
    DeviceID: Number,
    deviceName: String,
    Connected: String,
    Date: String,
    Time: String,
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
    FetchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

historySchema.pre("save", function (next) {
  if (this.DeviceID && !this.deviceName) {
    this.deviceName = `DEV-${this.DeviceID}`;
  }
  next();
});

module.exports = mongoose.model("DeviceLogHistory", historySchema);
