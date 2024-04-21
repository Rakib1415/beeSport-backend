const { body, param } = require("express-validator");
const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");
const PopularFootballLeague = require("../../models/PopularFootballLeague");

const validateCreateLeague = [
  body("name").notEmpty().withMessage("Name is required"),
  body("id").notEmpty().withMessage("League ID is required")
];

const validateSingleLeague = [param("id").notEmpty().withMessage("League ID is required")];

// Get all Leagues
router.get("/", async (req, res, next) => {
  try {
    const footballLeagues = await PopularFootballLeague.find().sort({
      position: "asc"
    });

    res.status(200).json({
      status: true,
      message: footballLeagues.length === 0 ? "No football leagues found!" : "Football leagues fetched successfully!",
      data: footballLeagues
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

    const { name, id, imagePath, country, currentSeason, category } = req.body;

    const existingLeague = await PopularFootballLeague.findOne({
      $or: [{ id: id }]
    });

    if (existingLeague) {
      return res.status(200).json({
        status: false,
        message: "This league already added!"
      });
    }

    const footballLeague = new PopularFootballLeague({
      id,
      name,
      imagePath,
      country,
      currentSeason,
      category
    });

    const savedLeague = await footballLeague.save();

    res.status(201).json({
      status: true,
      message: "League Added successfully!",
      data: savedLeague
    });
  } catch (error) {
    next(error);
  }
});

// Sort Popular League
router.post("/sort", async (req, res, next) => {
  try {
    const leagueWithPosition = req.body;

    await Promise.all(
      leagueWithPosition.map(async (singleLeague) => {
        const league = await PopularFootballLeague.findOne({ id: singleLeague.id });
        league.position = singleLeague.position;
        await league.save();

        return league;
      })
    );

    return res.status(200).json({
      status: true,
      message: "Football League Sorted Successfully!"
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// Delete League by ID
router.delete("/:id", validateSingleLeague, async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedLeague = await PopularFootballLeague.deleteOne({
      id: id
    });

    if (!deletedLeague) {
      return res.status(404).json({ status: false, message: "League not found!" });
    }

    res.status(200).json({
      status: true,
      message: "Football league removed successfully!"
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
