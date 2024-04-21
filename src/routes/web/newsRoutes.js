const express = require("express");
const { getSingleNews, getGroupByLeague } = require("../../controllers/web/newsController");
const { query } = require("express-validator");
const router = express.Router();

router.get(
  "/group-by-league",
  [
    query("category")
      .isIn(["cricket", "football"])
      .withMessage("Category in query params either cricket or football!")
      .notEmpty()
      .withMessage("Category in query params is required!")
  ],
  getGroupByLeague
);

router.get("/:slug", getSingleNews);

module.exports = router;
