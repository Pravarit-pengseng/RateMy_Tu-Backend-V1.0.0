require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const bodyParse = require("body-parser");
const { readdirSync } = require("fs");
const bodyParser = require("body-parser");
const connectDB = require("./Config/db");
const path = require("path");

const app = express();

connectDB();
// Root route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use(morgan("dev"));
app.use(cors());
app.use(bodyParse.json({ limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

readdirSync("./Routes").map((r) => app.use("/api", require("./Routes/" + r)));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server is running "));
