const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const connectDB = require("./config/db");
const { processSerialData } = require("./services/serialService");
require("dotenv").config();

// Connect to MongoDB
connectDB();

// Setup serial port
const port = new SerialPort({
  path: process.env.SERIAL_PORT || "COM3",
  baudRate: parseInt(process.env.BAUD_RATE) || 115200,
});

const parser = port.pipe(new ReadlineParser({ delimiter: ":" }));

// Handle serial data
parser.on("data", async (line) => {
  await processSerialData(line);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down...");
  await port.close();
  process.exit(0);
});
