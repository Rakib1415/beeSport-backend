const { getAllFixtures , createSelectedFixtures} = require('../controllers/fixture-controllers');

const router = require('express').Router();


router.get('/', getAllFixtures);
router.post('/', createSelectedFixtures);

module.exports = router;

