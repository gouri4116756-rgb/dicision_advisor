const express = require("express");
const cors = require("cors");

const advisorRoutes = require("./routes/advisor.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.use("/api/advisor", advisorRoutes);
app.get("/api/health", (req, res) => {
  res.json({
    status: "Backend running"
  });
});


module.exports = app;