const { sportMonksCricketUrl } = require("../../utils/getAxios");

async function sportMonksCricketV2Data(req, res) {
  const removedPrefixUrl = req.originalUrl.replace("/v2/cricket", "");

  let urlEndpoint = removedPrefixUrl.split("?")[0];
  const urlQueryString = removedPrefixUrl.split("?")[1];

  try {
    const { data } = await sportMonksCricketUrl.get(`${urlEndpoint}?${urlQueryString}`);

    if (urlEndpoint === "/fixtures") {
      try {
        let fixtures = [];
        let groupByLeague = [];

        fixtures = fixtures?.concat(data?.data);
        fixtures?.forEach((fixture) => {
          const leagueIndex = groupByLeague.findIndex((league) => league?.id === fixture?.league.id);

          if (leagueIndex !== -1) {
            groupByLeague[leagueIndex].fixtures.push(fixture);
          } else {
            groupByLeague.push({
              id: fixture.league.id,
              name: fixture.league.name,
              image: fixture.league.image_path,
              fixtures: [fixture]
            });
          }
        });

        if (!res.headersSent) {
          res.json({
            status: true,
            message: "Group-Wise Fixture Data Fetched Successfully!",
            data: groupByLeague
          });
        }
      } catch (err) {
        res.json({
          status: false,
          message: err.message
        });
      }
    }

    res.json({
      status: !!data?.data,
      message: "Data Fetched Successfully!",
      data: data?.data ? data?.data : "No Data Found!"
    });
  } catch (err) {
    if (!res.headersSent) {
      res.json({
        status: false,
        message: err.message
      });
    }
  }
}

module.exports = {
  sportMonksCricketV2Data
};
