const fs = require("fs-extra");
const path = require("path");
const DeviceLog = require("../models/deviceLogModel");
const DeviceLogHistory = require("../models/deviceLogHistoryModel");
const { getCurrentDate, getCurrentTime } = require("../utils/datetime");

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
    const parts = clean.split(","); // NEW

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
    };

    if (isShortMachine) {
      logEntry.Machine = rawValues[0];
      logEntry.Connected =
        rawValues[0] === "Yes" ? "Yes" : rawValues[0] === "NC" ? "NC" : "No";

      console.log("📋 Parsed Short Machine Entry:");
      console.log(`   DeviceID  : ${deviceID}`);
      console.log(`   Machine   : ${logEntry.Machine}`);
      console.log(`   Connected : ${logEntry.Connected}`);
    } else {
      const keys = ["Operator1", "Operator2", "Mat1", "Mat2"];
      keys.forEach((key, idx) => {
        logEntry[key] = rawValues[idx] || "NC";
      });

      const allYes = rawValues.every((v) => v === "Yes");
      const allNC = rawValues.every((v) => v === "NC");
      logEntry.Connected = allYes ? "Yes" : allNC ? "NC" : "No";

      console.log("📋 Parsed Full Entry:");
      console.log(`   DeviceID  : ${deviceID}`);
      console.log(`   Operator1 : ${logEntry.Operator1}`);
      console.log(`   Operator2 : ${logEntry.Operator2}`);
      console.log(`   Mat1      : ${logEntry.Mat1}`);
      console.log(`   Mat2      : ${logEntry.Mat2}`);
      console.log(`   Connected : ${logEntry.Connected}`);
    }

    await DeviceLog.findOneAndUpdate(
      { DeviceID: deviceID },
      { $set: logEntry },
      { upsert: true, new: true }
    );

    await DeviceLogHistory.create(logEntry);
    await appendToCSV(logEntry);
    await cleanupOldLogs();

    console.log("✅ Entry successfully processed and logged.\n");
  } catch (err) {
    console.error("❌ Error in processing serial data:", err.message);
  }
};

module.exports = { processSerialData };
