import { SerialPort } from "serialport";

const simulatedPort = new SerialPort({
  path: "COM10",
  baudRate: 115200,
});

simulatedPort.on("open", () => {
  console.log("🟢 Simulated COM10 device sending data every 2 seconds...");

  setInterval(() => {
    const randomId = Math.random() < 0.5 ? 2 : 40;

    let results = [];

    if (randomId === 2) {
      // Send only one value: PASS, FAIL or NC
      const options = ["PASS", "FAIL", "NC"];
      results = [options[Math.floor(Math.random() * options.length)]];
    } else {
      // For ID 40, send 4 values with mixed PASS, FAIL, NC
      const options = ["PASS", "FAIL", "NC"];
      results = Array.from({ length: 4 }, () =>
        options[Math.floor(Math.random() * options.length)]
      );
    }

    const output = `${randomId}\t${results.join("\t")}:\r\n`;

    simulatedPort.write(output, (err) => {
      if (err) {
        console.error("❌ Write error:", err.message);
      } else {
        console.log("📤 Sent:", output.trim());
      }
    });
  }, 2000);
});

simulatedPort.on("error", (err) => {
  console.error("❌ Error on COM10:", err.message);
});
