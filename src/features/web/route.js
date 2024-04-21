const router = require('express').Router();
const fixtureWebRoutes = require("./fixtures/routes");

router.use('/fixtures', fixtureWebRoutes);


module.exports = router;