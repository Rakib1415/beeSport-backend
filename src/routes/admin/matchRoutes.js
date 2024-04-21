const express = require("express");
const { body, param } = require("express-validator");
const {
  createMatch,
  updateMatch,
  getMatchWithStreams,
  getAllMatches,
  deleteMatchWithStreams,
  sortMatch,
  sortStreamingSource
} = require("../../controllers/admin/liveMatchController");

const router = express.Router();

// Get All Live Matches
router.get("/", getAllMatches);

// Create Live Match
router.post(
  "/create",
  [
    body("time").notEmpty().withMessage("Time is required"),
    body("match_title").notEmpty().withMessage("Title is required"),
    body("team_one_name").notEmpty().withMessage("Team one name is required"),
    body("team_two_name").notEmpty().withMessage("Team two name is required"),
    body("streaming_sources").isArray().withMessage("Streaming sources must be an array")
  ],
  createMatch
);

// Sort By Position
router.post("/sort", sortMatch);
router.post("/streaming-sort", sortStreamingSource);

// Update a Live Match
router.put(
  "/:matchId",
  [
    param("matchId").notEmpty().withMessage("LiveMatch ID is required"),
    body("time").notEmpty().withMessage("Time is required"),
    body("match_title").notEmpty().withMessage("Title is required"),
    body("team_one_name").notEmpty().withMessage("Team one name is required"),
    body("team_two_name").notEmpty().withMessage("Team two name is required"),
    body("streaming_sources").isArray().withMessage("Streaming sources must be an array")
  ],
  updateMatch
);

// Get a Single Live Match
router.get("/:matchId", [param("matchId").notEmpty().withMessage("LiveMatch ID is required")], getMatchWithStreams);

// Delete a Single Live Match
router.delete(
  "/:matchId",
  [param("matchId").notEmpty().withMessage("LiveMatch ID is required")],
  deleteMatchWithStreams
);

module.exports = router;
