const router = require('express').Router();
const fixtureRoutes = require("./fixtures/routes");

router.use('/fixtures', fixtureRoutes);


module.exports = router;