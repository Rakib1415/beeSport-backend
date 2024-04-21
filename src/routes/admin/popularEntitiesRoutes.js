const { body } = require("express-validator");
const express = require("express");
const {
  getPopularEntities,
  deletePopularEntity,
  createPopularEntity
} = require("../../controllers/admin/popularEntitiesController");
const router = express.Router();

// Routes
router.post(
  "/",
  [
    body("sports")
      .trim()
      .isIn(["cricket", "football"])
      .withMessage("Sports either cricket or football!")
      .notEmpty()
      .withMessage("Sports is required!"),
    body("entity")
      .trim()
      .isIn(["leagues", "teams", "players"])
      .withMessage("Entity either leagues, teams or players!")
      .notEmpty()
      .withMessage("Entity is required!"),
    body("id").trim().notEmpty().withMessage("Id is required!"),
    body("name").trim().notEmpty().withMessage("Name is required!"),
    body("logo").trim().notEmpty().withMessage("Logo is required!"),
    body("country").trim().notEmpty().withMessage("Country is required!"),
    body("currentSeason").if(body("entity").equals("leagues")).notEmpty().withMessage("Current Season is required!")
  ],
  createPopularEntity
);

router.get("/:sports/:entity", getPopularEntities);

router.delete("/:sports/:entity/:id", deletePopularEntity);

module.exports = router;
