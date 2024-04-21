
const router = require("express").Router();
const { getCricketFixturesByIds, getAllCricketleagues, getAllCricketTeams } = require("../../controllers/web/cricketFixtureController");



router.get("/fixtures", getCricketFixturesByIds);
router.get("/leagues", getAllCricketleagues);
router.get("/teams", getAllCricketTeams);


module.exports = router;