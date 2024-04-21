const { body, param } = require("express-validator");
const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");
const PopularLeague = require("../../models/PopularLeague");
const {
  createLeague,
  getAllLeague,
  updatePointTable,
  deleteLeague
} = require("../../controllers/admin/popularLeagueController");

const validateCreateLeague = [
  body("name").notEmpty().withMessage("Name is required"),
  body("id").notEmpty().withMessage("League ID is required")
];

const validateSingleLeague = [param("id").notEmpty().withMessage("League ID is required")];

// Get all Leagues
router.get("/", getAllLeague);

// Create a League
router.post("/create", validateCreateLeague, createLeague);

// Update Point Table
router.post("/update/select-point-table", updatePointTable);
// delete League
router.delete("/:leagueId", deleteLeague);

// Sort Popular League
router.post("/sort", async (req, res, next) => {
  try {
    const leagueWithPosition = req.body;

    await Promise.all(
      leagueWithPosition.map(async (singleLeague) => {
        const league = await PopularLeague.findOne({ id: singleLeague.id });
        league.position = singleLeague.position;
        await league.save();

        return league;
      })
    );

    return res.status(200).json({
      status: true,
      message: "Popular League Sorted Successfully!"
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
    const deletedLeague = await PopularLeague.deleteOne({
      id: id
    });

    if (!deletedLeague) {
      return res.status(404).json({ status: false, message: "League not found!" });
    }

    res.status(200).json({
      status: true,
      message: "League removed successfully!"
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
