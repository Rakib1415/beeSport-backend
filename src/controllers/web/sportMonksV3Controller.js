const { sportMonkslUrl } = require("../../utils/getAxios");

async function sportMonksV3Data(req, res) {
  const removedPrefixUrl = req.originalUrl.replace("/v3/football", "");

  let urlEndpoint = removedPrefixUrl.split("?")[0];
  const urlQueryString = removedPrefixUrl.split("?")[1];


  if (urlEndpoint === "/leagues" || urlEndpoint.includes("/leagues/search")) {
    try {
      let has_more = true;
      let page = 1;
      let leagues = [];

      while (has_more) {
        const { data } = await sportMonkslUrl.get(`${urlEndpoint}?${urlQueryString}&page=${page}&per_page=50`);

        leagues = leagues.concat(data?.data);
        has_more = data.pagination.has_more;
        page++;
      }

      res.json({
        status: true,
        message: "Leagues Data Fetched Successfully!",
        data: leagues
      });
    } catch (err) {
      res.json({
        status: false,
        message: err.message
      });
    }
  }
  // Fixture By Date
  else if (urlEndpoint.includes("/fixtures/date")) {
    try {
      let has_more = true;
      let page = 1;
      let fixtures = [];

      while (has_more) {
        const { data } = await sportMonkslUrl.get(`${urlEndpoint}?${urlQueryString}&page=${page}&per_page=50`);

        fixtures = fixtures.concat(data?.data);
        has_more = data.pagination.has_more;
        page++;
      }

      res.json({
        status: true,
        message: "Fixtures Data Fetched Successfully!",
        data: fixtures
      });
    } catch (err) {
      res.json({
        status: false,
        message: err.message
      });
    }
  }
  // Fixture By Date (League Wise Group Formatted)
  else if (urlEndpoint.includes("/fixtures/formatted/date")) {
    urlEndpoint = urlEndpoint.replace("/formatted", "");

    try {
      let has_more = true;
      let page = 1;
      let fixtures = [];
      let groupByLeague = [];

      while (has_more) {
        const { data } = await sportMonkslUrl.get(`${urlEndpoint}?${urlQueryString}&page=${page}&per_page=50`);

        fixtures = fixtures.concat(data?.data);
        has_more = data.pagination.has_more;
        page++;
      }

      fixtures.forEach((fixture) => {
        const leagueIndex = groupByLeague.findIndex((league) => league.id === fixture.league.id);

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

      res.json({
        status: true,
        message: "Group-Wise Fixture Data Fetched Successfully!",
        data: groupByLeague
      });
    } catch (err) {
      res.json({
        status: false,
        message: err.message
      });
    }
  } else {
    try {
      const { data } = await sportMonkslUrl.get(`${urlEndpoint}?${urlQueryString}`);


      res.json({
        status: !!data?.data,
        message: "Data Fetched Successfully!",
        data: data?.data ? data?.data : "No Data Found!"
      });
    } catch (err) {
      res.json({
        status: false,
        message: err.message
      });
    }
  }
}

module.exports = {
  sportMonksV3Data
};
