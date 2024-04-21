const LiveMatch = require("../../models/LiveMatch");
const { excludeMany, exclude } = require("../../utils");

const getLiveMatches = async () => {
  try {
    const matches = await LiveMatch.find().sort({ position: "asc" });

    const filteredMatches = matches.map((match) => {
      const matchObject = match.toObject();
      exclude(matchObject, [
        "_id",
        "__v",
        "apps",
        "fixture_id",
        "sports_type",
        "league",
        "time",
        "streaming_sources",
        "status",
        "leagueId",
        "sportsTypeId"
      ]);
      return matchObject;
    });

    return filteredMatches;
  } catch (error) {
    console.error("Error getting live matches:", error);
    throw new Error("Failed to fetch live matches");
  }
};

module.exports = { getLiveMatches };
