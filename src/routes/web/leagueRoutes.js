const express = require("express");
const { getTopLeagues, getSelectedPointTable } = require("../../controllers/web/leagueController");
const router = express.Router();

router.get("/top-leagues", getTopLeagues);

router.get("/selected-point-table/:category", getSelectedPointTable);

module.exports = router;
