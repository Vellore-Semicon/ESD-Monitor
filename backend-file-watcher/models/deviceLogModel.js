const mongoose = require("mongoose");
const MasterDevice = require("./masterDeviceModel");

const logSchema = new mongoose.Schema(
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
    ConnectedToWrongMaster: { type: Boolean, default: false }, // new parameter
  },
  { timestamps: true }
);

// Pre-save hook
logSchema.pre("save", async function (next) {
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

  // Check if MasterDevice exists and compare MasterCode
  if (this.masterDeviceId && this.MasterCode) {
    try {
      const masterDevice = await MasterDevice.findById(this.masterDeviceId);
      if (masterDevice) {
        this.ConnectedToWrongMaster =
          masterDevice.masterCode !== this.MasterCode;
      } else {
        this.ConnectedToWrongMaster = true;
      }
    } catch (err) {
      return next(err);
    }
  }

  next();
});

logSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const update = this.getUpdate();
    const masterDeviceId =
      update.masterDeviceId || this._conditions.masterDeviceId;
    const masterCode = update.MasterCode;

    if (masterDeviceId && masterCode) {
      const masterDevice = await MasterDevice.findById(masterDeviceId);
      if (masterDevice) {
        update.ConnectedToWrongMaster = masterDevice.masterCode !== masterCode;
      } else {
        update.ConnectedToWrongMaster = true;
      }
      this.setUpdate(update); // apply back updated field
    }
    next();
  } catch (err) {
    next(err);
  }
});

// ✅ Prevent OverwriteModelError
module.exports =
  mongoose.models.DeviceLog || mongoose.model("DeviceLog", logSchema);
