const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Backend running");
});

app.listen(5001, () => {
  console.log("Backend running on http://localhost:5001");
});
