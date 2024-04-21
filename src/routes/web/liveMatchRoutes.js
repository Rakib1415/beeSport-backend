const express = require("express");
const {
  getAllLiveMatches,
  getSingleLiveMatch,
  getFixturesIds,
  getSources
} = require("../../controllers/web/liveMatchController");
const router = express.Router();

router.get("/", async (req, res) => {
  const liveMatches = await getAllLiveMatches();
  res.status(200).json(liveMatches);
});

router.get("/fixture-ids", async (req, res) => {
  const liveMatch = await getFixturesIds();
  res.status(200).json(liveMatch);
});

router.get("/sources/:fixtureId", async (req, res) => {
  const { fixtureId } = req.params;
  const liveMatch = await getSources(fixtureId, req.userIp);
  res.status(200).json(liveMatch);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const liveMatch = await getSingleLiveMatch(id);
  res.status(200).json(liveMatch);
});

module.exports = router;
