const express = require("express");
const router = express.Router();
const { userAuth } = require("../middlewares/userAuth");

// Admin Routes
router.use("/", require("./admin/adminRoutes"));
router.use("/users", require("./admin/userRoutes"));
router.use("/news", userAuth, require("./admin/newsRoutes"));
router.use("/matches", userAuth, require("./admin/matchRoutes"));
router.use("/notifications", userAuth, require("./admin/notificationRoutes"));
router.use("/fixtures", require("./admin/fixtureRoutes"));
router.use("/administration-settings", userAuth, require("./admin/administratorSettingsRoute"));
router.use("/highlights", userAuth, require("./admin/highlightRoutes"));
router.use("/popular-leagues", userAuth, require("./admin/popularLeagueRoutes"));
router.use("/banner", userAuth, require("./admin/bannerRoutes"));
router.use("/tipster", userAuth, require("./admin/tipSterRoutes"));

router.use("/popular-entities", userAuth, require("./admin/popularEntitiesRoutes"));
router.use("/news-league", userAuth, require("./admin/newsLeagueRoutes"));
router.use("/popular/football-leagues", userAuth, require("./admin/footballLeaguesRoutes"));
router.use("/popular/cricket-leagues", userAuth, require("./admin/cricketLeaguesRoutes"));
router.use("/subscriptions", userAuth, require("./admin/subscriptionRoutes"));

module.exports = router;
