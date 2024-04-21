const express = require("express");
const { sportMonkslUrl } = require("../../utils/getAxios");
const { default: axios } = require("axios");
const router = express.Router();

// Get all AdsTypes
router.post("/", async (req, res, next) => {
  try {
    const { date } = req.body;
    let has_more = true;
    let page = 1;
    let fixtures = [];

    while (has_more) {
      const { data } = await sportMonkslUrl.get(
        `/fixtures/date/${date}?include=league.country;round.stage;participants;state;scores;periods&page=${page}`
      );

      fixtures = fixtures.concat(data?.data);
      has_more = data.pagination.has_more;
      page++;
    }

    let group_by_league = {};

    fixtures.forEach((fixture) => {
      if (group_by_league[fixture.league.id] !== undefined) {
        group_by_league[fixture.league.id].push(fixture);
      } else {
        group_by_league[fixture.league.id] = [];
        group_by_league[fixture.league.id].push(fixture);
      }
    });

    const sortedKeys = Object.keys(group_by_league).sort();

    const sortedObj = {};

    sortedKeys.forEach((key) => {
      sortedObj[key] = group_by_league[key];
    });

    res.send({
      status: true,
      result: sortedObj
    });
  } catch (error) {
    next(error);
  }
});

// Get highlights from fixtures
router.get("/highlights/:fixture_id", async (req, res, next) => {
  try {
    const { fixture_id } = req.params;
    const { data } = await axios.get(
      `https://soccer.sportmonks.com/api/v2.0/highlights/fixture/${fixture_id}?api_token=${process.env.SPORTMONKS_API_TOKEN}`
    );

    res.send({
      status: true,
      message: "Highlight fetched successfully!",
      data: data?.data
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
