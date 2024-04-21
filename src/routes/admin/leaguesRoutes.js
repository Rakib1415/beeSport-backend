const { body, param } = require("express-validator");
const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");
const Leagues = require("../../models/League");
const { generateRandomId } = require("../../utils");

const validateCreateLeague = [body("name").notEmpty().withMessage("Name is required")];

const validateSingleLeague = [param("leagueId").notEmpty().withMessage("League ID is required")];

// Get all Leagues
router.get("/", async (req, res, next) => {
  try {
    const leagues = await Leagues.find().sort({ createdAt: "desc" });

    res.status(200).json({
      status: true,
      message: leagues.length === 0 ? "No Leagues found." : "Leagues fetched successfully!",
      data: leagues
    });
  } catch (error) {
    next(error);
  }
});

// Create a League
router.post("/create", validateCreateLeague, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false, errors: errors.array() });
    }

    const { name, status } = req.body;

    const existingLeagues = await Leagues.find({ name });

    if (existingLeagues.length) {
      return res.status(200).json({ status: false, message: "League already exists!" });
    }

    const image = req.body.image !== "" ? req.body.image : `${process.env.BACKEND_URL}/public/default/team-logo.png`;

    const league = new Leagues({
      name,
      image,
      status,
      id: generateRandomId(11)
    });

    const savedLeague = await league.save();

    res.status(201).json({
      status: true,
      message: "League created successfully!",
      data: savedLeague
    });
  } catch (error) {
    next(error);
  }
});

// Find League by ID
router.get("/:leagueId", validateSingleLeague, async (req, res, next) => {
  try {
    const id = req.params.leagueId;
    const league = await Leagues.findById(id);

    if (!league) {
      return res.status(404).json({ status: false, message: "League not found." });
    }

    res.status(200).json({
      status: true,
      message: "League fetched successfully",
      data: league
    });
  } catch (error) {
    next(error);
  }
});

// Update League by ID
router.put("/:leagueId", validateCreateLeague, async (req, res, next) => {
  try {
    const id = req.params.leagueId;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false, errors: errors.array() });
    }

    const { status, name, image } = req.body;

    const existingLeague = await Leagues.findById(id);

    if (!existingLeague) {
      return res.status(404).json({ status: false, message: "League not found." });
    }

    // Check if another League with the same name already exists
    const existingLeaguesWithSameName = await Leagues.findOne({
      name,
      _id: { $ne: id }
    });

    if (existingLeaguesWithSameName) {
      return res.status(400).json({
        status: false,
        message: "League with the same name already exists."
      });
    }

    // Update League properties
    existingLeague.name = name || existingLeague.name;
    existingLeague.status = status || existingLeague.status;
    existingLeague.image = image || existingLeague.image;

    const updatedLeague = await existingLeague.save();

    res.status(200).json({
      status: true,
      message: "League updated successfully",
      data: updatedLeague
    });
  } catch (error) {
    next(error);
  }
});

// Delete League by ID
router.delete("/:leagueId", validateSingleLeague, async (req, res, next) => {
  try {
    const id = req.params.leagueId;
    const deletedLeague = await Leagues.findByIdAndDelete(id);

    if (!deletedLeague) {
      return res.status(404).json({ status: false, message: "League not found." });
    }

    res.status(200).json({
      status: true,
      message: "League deleted successfully",
      data: deletedLeague
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
