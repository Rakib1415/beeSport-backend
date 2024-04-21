// External Import
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const useragent = require("express-useragent");
const logger = require("morgan");

// Internal Import
const config = require("./config");
const connectToDatabase = require("./database");
const configureCloudinary = require("./cloudinary");
// const webRouter = require("../src/routes/webRouter");
const webRouter = require("../src/features/web/route");
// const adminRouter = require("../src/routes/adminRouter");
const adminRouter = require("../src/features/admin/route");
const errorMiddleware = require("../src/middlewares/errorMiddleware");
const { verifyApiKeyHeader } = require("../src/middlewares/userAuth");
const getUserIpMiddleware = require("../src/middlewares/getUserIpMiddleware");
const { sportMonksV3Data } = require("../src/controllers/web/sportMonksV3Controller");
const { sportMonksCricketV2Data } = require("../src/controllers/web/sportMonksCricketV2Controller");
const { getCricketFixturesByIds, getAllCricketleagues, getAllCricketTeams } = require("../src/controllers/web/cricketFixtureController");

const app = express();
const env = process.env.NODE_ENV || "development";

// Connect to MongoDB with Mongoose
connectToDatabase(config[env].databaseURI);

// Connect to Cloudinary
// configureCloudinary();

// Middleware
app.use(logger("dev"));
app.use(getUserIpMiddleware);
app.use(useragent.express());
app.use(cors(config[env].corsOptions));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// File Access
app.use("/", express.static(path.join(__dirname, "../public")));

// configure for getting ip address
app.set("trust proxy", true);

// Router
app.get("/", (req, res) => {
  console.log(req.method);
  res.send("Welcome to MahaScore Web Api!");
});

app.use("/api/admin", verifyApiKeyHeader, adminRouter); // admin
app.use("/api", verifyApiKeyHeader, webRouter); // web
app.use("/v3/football/*", verifyApiKeyHeader, sportMonksV3Data); // web (football)
app.use("/v2/cricket/*", verifyApiKeyHeader, sportMonksCricketV2Data); // web (cricket)

// 404 Route
app.use((req, res, next) => {
  return res.status(404).send({ status: false, message: "This route does not exist!" });
});

// Error Handling Middleware
app.use(errorMiddleware);

module.exports = app;
