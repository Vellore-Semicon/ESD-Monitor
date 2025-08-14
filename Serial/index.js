import { SerialPort } from "serialport";

const simulatedPort = new SerialPort({
  path: "COM11",
  baudRate: 115200,
});

simulatedPort.on("open", () => {
  console.log("🟢 Simulated COM11 device sending data every 2 seconds...");

  setInterval(() => {
    const randomId = Math.random() < 0.5 ? 2 : 20;
    const options = ["PASS", "FAIL", "NC"];
    let results = [];

    if (randomId === 2) {
      results = [options[Math.floor(Math.random() * options.length)]];
    } else {
      results = Array.from(
        { length: 4 },
        () => options[Math.floor(Math.random() * options.length)]
      );
    }

    // Add colon at the end so ReadlineParser with ":" works
    const output = `${randomId},${results.join(",")}:`;

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
  console.error("❌ Error on COM11:", err.message);
});
