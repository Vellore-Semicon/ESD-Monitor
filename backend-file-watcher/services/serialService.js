const fs = require("fs-extra");
const path = require("path");
const DeviceLog = require("../models/deviceLogModel");
const DeviceLogHistory = require("../models/deviceLogHistoryModel");
const { getCurrentDate, getCurrentTime } = require("../utils/datetime");
const mongoose = require("mongoose");
const { log } = require("console");

const LOG_DIR = path.join(__dirname, "../logs");
fs.ensureDirSync(LOG_DIR);

// Convert serial input values
const mapValue = (val) => {
  val = val.trim().toUpperCase();
  if (val === "PASS") return "Yes";
  if (val === "FAIL") return "No";
  return "NC";
};

const appendToCSV = async (entry) => {
  const fileName = `${entry.Date}.csv`;
  const filePath = path.join(LOG_DIR, fileName);

  let header;
  let row;

  if ("Machine" in entry) {
    header =
      "DeviceID,Connected,Date,Time,Operator1,Operator2,Mat1,Mat2,Machine\n";
    row =
      [
        entry.DeviceID,
        entry.Connected,
        entry.Date,
        entry.Time,
        entry.Operator1 || "-",
        entry.Operator2 || "-",
        entry.Mat1 || "-",
        entry.Mat2 || "-",
        entry.Machine || "-",
      ].join(",") + "\n";
  } else {
    header =
      "DeviceID,Connected,Date,Time,Operator1,Operator2,Mat1,Mat2,Machine\n";
    row =
      [
        entry.DeviceID,
        entry.Connected,
        entry.Date,
        entry.Time,
        entry.Operator1 || "-",
        entry.Operator2 || "-",
        entry.Mat1 || "-",
        entry.Mat2 || "-",
        entry.Machine || "-",
      ].join(",") + "\n";
  }

  const exists = await fs.pathExists(filePath);
  if (!exists) {
    await fs.outputFile(filePath, header + row);
  } else {
    await fs.appendFile(filePath, row);
  }
};

const cleanupOldLogs = async () => {
  const files = await fs.readdir(LOG_DIR);
  const now = new Date();

  for (const file of files) {
    const match = file.match(/^(\d{8})\.csv$/); // match YYYYMMDD.csv
    if (!match) continue;

    const fileDate = new Date(
      +match[1].slice(0, 4),
      +match[1].slice(4, 6) - 1,
      +match[1].slice(6, 8)
    );

    const ageInDays = Math.floor((now - fileDate) / (1000 * 60 * 60 * 24));
    if (ageInDays > 10) {
      await fs.remove(path.join(LOG_DIR, file));
      console.log(`🗑️ Deleted old log: ${file}`);
    }
  }
};

const processSerialData = async (line) => {
  try {
    console.log(`📥 Raw Input: ${line.trim()}`);

    const clean = line.replace(":", "").trim();
    const parts = clean.split(",");

    const deviceID = parseInt(parts[0], 10);
    const rawValues = parts.slice(1).map(mapValue);
    const isShortMachine = parts.length === 2;

    const date = getCurrentDate();
    const time = getCurrentTime();

    let logEntry = {
      DeviceID: deviceID,
      Date: date,
      Time: time,
      MasterCode: process.env.MASTER_CODE || "DefaultMasterCode",
      FetchedAt: new Date(),
    };

    if (isShortMachine) {
      logEntry.Machine = rawValues[0];
      logEntry.Connected = "Yes";
    } else {
      const keys = ["Operator1", "Operator2", "Mat1", "Mat2"];
      keys.forEach((key, idx) => {
        logEntry[key] = rawValues[idx] || "NC";
      });
      logEntry.Connected = "Yes";
    }

    // 1️⃣ Fetch existing device log (old values)
    const existing = await DeviceLog.findOne({ DeviceID: deviceID });
    // console.log(
    //   "🔍 Existing Log (before update):",
    //   existing ? existing.toObject() : "None (new device)"
    // );

    // 2️⃣ Compare before updating
    let hasChanged = false;
    if (!existing) {
      console.log("🆕 First-time entry → marking as changed");
      hasChanged = true;
    } else {
      const keysToCheck = [
        "Operator1",
        "Operator2",
        "Mat1",
        "Mat2",
        "Machine",
        "Connected",
      ];

      console.log("🔎 Comparing fields (ignoring time)...");
      keysToCheck.forEach((key) => {
        const oldVal = existing[key];
        const newVal = logEntry[key];
        if (oldVal !== newVal) {
          console.log(
            `⚡ Change detected in ${key}: "${oldVal}" → "${newVal}"`
          );
        } else {
          console.log(`✅ No change in ${key}: still "${newVal}"`);
        }
      });

      hasChanged = keysToCheck.some((key) => existing[key] !== logEntry[key]);
    }

    console.log(
      "📊 Change Status:",
      hasChanged ? "CHANGED ✅" : "UNCHANGED ❌"
    );

    // 3️⃣ Now update DeviceLog (after comparison)
    const updatedDeviceLog = await DeviceLog.findOneAndUpdate(
      { DeviceID: deviceID },
      { $set: logEntry },
      { upsert: true, new: true }
    );
    //console.log("🆕 Updated DeviceLog:", updatedDeviceLog.toObject());
    logEntry.customerId = updatedDeviceLog.customerId;
    logEntry.masterDeviceId = updatedDeviceLog.masterDeviceId;

    // 4️⃣ Only record history and append CSV if data changed
    if (hasChanged) {
      const historyEntry = await DeviceLogHistory.create(logEntry);
      //console.log("📚 History Entry Recorded:", historyEntry.toObject());

      await appendToCSV(logEntry);
      console.log("📑 CSV Updated with new entry.");
    } else {
      console.log("ℹ️ No changes detected. Skipping history & CSV logging.");
    }

    await cleanupOldLogs();

    console.log("✅ Entry successfully processed and logged.\n");
  } catch (err) {
    console.error("❌ Error in processing serial data:", err.message);
  }
};

module.exports = { processSerialData };
