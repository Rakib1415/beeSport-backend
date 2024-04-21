const { body, param } = require("express-validator");
const express = require("express");
const router = express.Router();
const {
  getAllNewsLeague,
  createNewsLeague,
  getNewsLeagueById,
  deleteNewsLeague,
  updateNewsLeague
} = require("../../controllers/admin/newsLeagueController");

// Validation
const validateNewsLeague = [
  body("name").notEmpty().withMessage("Name is required!"),
  body("status").isIn(["1", "0"]).withMessage("Status either 1 or 0!").notEmpty().withMessage("Status is required!")
];
const validateSingleNews = [param("newsLeagueId").notEmpty().withMessage("News League ID is required!")];

// Routes
router.get("/", getAllNewsLeague);
router.post("/", validateNewsLeague, createNewsLeague);
router.get("/:newsLeagueId", validateSingleNews, getNewsLeagueById);
router.put("/:newsLeagueId", validateNewsLeague, updateNewsLeague);
router.delete("/:newsLeagueId", validateSingleNews, deleteNewsLeague);

module.exports = router;
