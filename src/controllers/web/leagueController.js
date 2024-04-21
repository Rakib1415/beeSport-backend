const PopularLeague = require("../../models/PopularLeague");
const { sportMonkslUrl, sportMonksCricketUrl } = require("../../utils/getAxios");

const getTopLeagues = async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = {};
    if (category) {
      query.category = category;
    }

    const [docs, total] = await Promise.all([
      PopularLeague.find(query).sort({ createdAt: "asc" }),
      PopularLeague.countDocuments(query)
    ]);

    res.status(200).json({
      status: true,
      message: "Top League fetched successfully!",
      data: {
        docs,
        total
      }
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Something went wrong!" });
  }
};

const getSelectedPointTable = async (req, res) => {
  try {
    const { category = "football" } = req.params;

    const league = await PopularLeague.find({ category: category || "football " }).sort({ position: "asc" });

    // return res.json({ status: true, league });
    if (category === "football") {
      const { data: standingsResponse } = await sportMonkslUrl.get(
        `standings/seasons/${league[0]?.currentSeason}?include=details.type;group;participant;rule.type&filters=standingdetailTypes:129,130,131,132,133,134,179,187,135,136,137,138,139,140,185,141,142,143,144,145,146,186`
      );

      const footballfinalData = {
        league_name: league[0].name,
        league_image: league[0].image_path,
        standings: standingsResponse.data
      };
      return res.json({
        status: true,
        message: league ? "Selected point table or standings fetched successfully!" : "No Leagues found!",
        data: footballfinalData
      });
    } else {
      const { data: standingsResponse } = await sportMonksCricketUrl.get(
        `standings/season/${league[0]?.currentSeason}?include=league,stage,season`
      );
      // console.log("standingsResponse", standingsResponse);
      const cricketfinalData = {
        league_name: league[0].name,
        league_image: league[0].image_path,
        standings: standingsResponse.data
      };
      return res.json({
        status: true,
        message: league ? "Selected point table or standings fetched successfully!" : "No Leagues found!",
        data: cricketfinalData
      });
    }
  } catch (error) {
    // console.log(error);
    // throw new Error("Failed to get top league data!");
    return res.json({
      status: false,
      message: "Something went wrong!"
    });
  }
};

module.exports = {
  getTopLeagues,
  getSelectedPointTable
};
