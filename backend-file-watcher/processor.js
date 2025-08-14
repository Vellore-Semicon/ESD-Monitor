// index.js
require("dotenv").config();
const connectDB = require("./config/db");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const { processSerialData } = require("./services/serialService");

let port;
let parser;

function openPort() {
  console.log("🔌 Opening serial port...");

  port = new SerialPort({
    path: process.env.SERIAL_PORT || "COM3",
    baudRate: parseInt(process.env.BAUD_RATE) || 115200,
    autoOpen: true,
  });

  parser = port.pipe(new ReadlineParser({ delimiter: ":" }));

  parser.on("data", async (line) => {
    console.log("📩 Data:", line);
    await processSerialData(line);
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
}

// Connect to MongoDB first, then open serial port
(async () => {
  await connectDB();
  openPort();
})();
