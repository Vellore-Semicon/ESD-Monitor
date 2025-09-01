// index.js
require("dotenv").config();
const connectDB = require("./config/db");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const { processSerialData } = require("./services/serialService");

let port;
let parser;
let isOpening = false;

function openPort() {
  if (isOpening) return; // avoid duplicate retries
  isOpening = true;

  console.log("🔌 Opening serial port...");

  port = new SerialPort({
    path: process.env.SERIAL_PORT || "COM3",
    baudRate: parseInt(process.env.BAUD_RATE, 10) || 115200,
    autoOpen: false, // open manually
  });

  port.open((err) => {
    isOpening = false;
    if (err) {
      console.error("❌ Failed to open port:", err.message);
      console.log("Retrying in 3s...");
      return setTimeout(openPort, 3000);
    }

    console.log("✅ Serial port opened:", port.path);

    parser = port.pipe(new ReadlineParser({ delimiter: ":" }));

    parser.on("data", async (line) => {
      try {
        console.log("📩 Data:", line.trim());
        await processSerialData(line.trim());
      } catch (err) {
        console.error("❌ Failed to process data:", err.message);
      }
    });

    port.on("close", () => {
      console.log("⚠ Port closed. Retrying in 3s...");
      setTimeout(openPort, 3000);
    });

    port.on("error", (err) => {
      console.error("❌ Serial port error:", err.message);
      console.log("Retrying in 3s...");
      setTimeout(openPort, 3000);
    });
  });
}

// Connect to MongoDB first, then open serial port
(async () => {
  try {
    await connectDB();
    console.log("✅ DB connected. Waiting 2s before opening serial...");
    setTimeout(openPort, 2000);
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  }
})();
