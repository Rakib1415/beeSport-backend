const { getAllFixtures } = require("../controllers/fixture-controllers");

const router = require("express").Router();

router.get("/", getAllFixtures);

module.exports = router;