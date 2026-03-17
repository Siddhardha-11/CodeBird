const express = require("express");

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.get("/", (req, res) => {
  res.send("Hello from Generated Backend!");
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
