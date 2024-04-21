const { body, param } = require("express-validator");
const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");
const PopularCricketLeague = require("../../models/PopularCricketLeague");

const validateCreateLeague = [
  body("name").notEmpty().withMessage("Name is required"),
  body("id").notEmpty().withMessage("League ID is required")
];

const validateSingleLeague = [param("id").notEmpty().withMessage("League ID is required")];

// Get all Leagues
router.get("/", async (req, res, next) => {
  try {
    const cricketLeagues = await PopularCricketLeague.find().sort({
      position: "asc"
    });

    res.status(200).json({
      status: true,
      message: cricketLeagues.length === 0 ? "No cricket leagues found!" : "Cricket leagues fetched successfully!",
      data: cricketLeagues
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

    const { name, id, imagePath, country, currentSeason } = req.body;

    const existingLeague = await PopularCricketLeague.findOne({
      $or: [{ id: id }, { name: name }]
    });

    if (existingLeague) {
      return res.status(200).json({
        status: false,
        message: "This league already added!"
      });
    }

    const cricketLeague = new PopularCricketLeague({
      id,
      name,
      imagePath,
      country,
      currentSeason
    });

    const savedLeague = await cricketLeague.save();

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
        const league = await PopularCricketLeague.findOne({ id: singleLeague.id });
        league.position = singleLeague.position;
        await league.save();

        return league;
      })
    );

    return res.status(200).json({
      status: true,
      message: "Cricket League Sorted Successfully!"
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
    const deletedLeague = await PopularCricketLeague.deleteOne({
      id: id
    });

    if (!deletedLeague) {
      return res.status(404).json({ status: false, message: "League not found!" });
    }

    res.status(200).json({
      status: true,
      message: "Cricket league removed successfully!"
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
