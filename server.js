require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
// const bodyParser = require("body-parser");
const { readdirSync } = require("fs");
const connectDB = require("./Config/db");
const path = require("path");

const app = express();

connectDB();

app.use(morgan("dev"));
app.use(cors());
// app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true })); // เพิ่มบรรทัดนี้เผื่อไว้

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

readdirSync("./Routes").map((r) => app.use("/api", require("./Routes/" + r)));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server is running "));
