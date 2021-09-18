//region References
import express from "express";
import bodyParser from "body-parser";
import path from "path";
import cors from "cors";
require("dotenv").config();

const { PORT } = process.env;
const app = express();

app
  .use(
    bodyParser.urlencoded({
      limit: "50mb",
      extended: true,
      parameterLimit: 1000000,
    })
  )
  .use(bodyParser.json({ limit: "50mb", extended: true }))
  .use(cors());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/index.html"));
  // res.json({ status: "OK" });
});

var authController = require("./controller/authController.js")();
var userController = require("./controller/UserController.js")();

app.use("/api", authController);
app.use("/api/users", userController);
app.use("/api/hotels", userController);

app.listen(PORT, () => {
  console.log("Isomorphic JWT login " + PORT);
});
