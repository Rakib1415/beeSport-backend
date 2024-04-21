const express = require("express");
const { getHighlightsByDate, getHighlightById } = require("../../controllers/web/highlightController");
const router = express.Router();

router.get("/date/:date", getHighlightsByDate);
router.get("/:fixtureId", getHighlightById);

module.exports = router;
