const express = require("express");
const router = express.Router();
const userRoutes = require("./web/userRoutes");
const leagueRoutes = require("./web/leagueRoutes");
const liveMatchRoutes = require("./web/liveMatchRoutes");
const newsRoutes = require("./web/newsRoutes");
const generalSettingRoutes = require("./web/generalSettingRoutes");
const highlightRoutes = require("./web/highlightRoutes");
const subscriptionRoutes = require("./web/subscriptionRoutes");
const vote = require("./web/voteRoutes");
const banner = require("./web/bannerRoutes");
const tipSter = require("./web/tipSterRoutes");
const cricketRoutes = require("./web/cricketRoutes");
const { getAllowedStates } = require("../controllers/web/systemController");

// Web Routes
router.use("/user", userRoutes);
router.use("/league", leagueRoutes);
router.use("/live-matches", liveMatchRoutes);
router.use("/news", newsRoutes);
router.use("/general-settings", generalSettingRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/highlights", highlightRoutes);
router.use("/allowed-states", getAllowedStates);
router.use("/vote", vote);
router.use("/banner", banner);
router.use("/tipster", tipSter);
router.use("/cricket", cricketRoutes);

module.exports = router;
