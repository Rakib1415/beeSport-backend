const { userAuth } = require("../../middlewares/userAuth");
const Vote = require("../../models/Vote");
const router = require("express").Router();

/**
 * Retrieves the votes for a specific fixture identified by its ID.
 * Middleware 'userAuth' is used to authenticate the user.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Response} Returns JSON response indicating the status and votes for the fixture.
 */
router.get("/:fixtureId", userAuth, async (req, res, next) => {
  try {
    if (!req.params.fixtureId) return res.status(400).send({ status: false, message: "Fixture Id missing" });
    let votes = await Vote.findOne({ fixtureId: req.params.fixtureId });
    if (!votes) return res.status(404).send({ status: false, message: "Votes not found" });
    const { home, away, draw, users } = votes._doc;
    if (users.some((u) => u.toString() === req.user.id.toString())) votes._doc.user = true;
    const total = home + away + draw;
    votes._doc = {
      ...votes._doc,
      home: ((home / total) * 100).toFixed(2),
      away: ((away / total) * 100).toFixed(2),
      draw: ((draw / total) * 100).toFixed(2)
    };
    return res.status(200).send({ status: true, votes: votes._doc });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/**
 * Registers a user's vote for a specific fixture.
 * Middleware 'userAuth' is used to authenticate the user.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Response} Returns JSON response indicating the status and updated votes for the fixture.
 */
router.get("/:fixtureId/:vote", userAuth, async (req, res, next) => {
  try {
    if (!req.params.fixtureId || !["home", "away", "draw"].includes(req.params.vote))
      return res.status(400).send({ status: false, message: "Fixture Id missing or vote type is not valid" });

    let voteType = req.params.vote;
    let updateField = {};

    // Determine which field to update based on the vote type
    if (voteType === "home") {
      updateField = { $inc: { home: 1 }, $addToSet: { users: req.user.id } };
    } else if (voteType === "away") {
      updateField = { $inc: { away: 1 }, $addToSet: { users: req.user.id } };
    } else if (voteType === "draw") {
      updateField = { $inc: { draw: 1 }, $addToSet: { users: req.user.id } };
    }

    let updatedVotes = await Vote.findOneAndUpdate({ fixtureId: req.params.fixtureId }, updateField, {
      new: true,
      upsert: true
    });
    if (!updatedVotes) return res.status(404).send({ status: false, message: "Votes not found" });
    const { home, away, draw } = updatedVotes._doc;
    const total = home + away + draw;
    updatedVotes._doc = {
      ...updatedVotes._doc,
      home: ((home / total) * 100).toFixed(2),
      away: ((away / total) * 100).toFixed(2),
      draw: ((draw / total) * 100).toFixed(2),
      user: true
    };
    return res.status(200).send({ status: true, votes: updatedVotes._doc });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
