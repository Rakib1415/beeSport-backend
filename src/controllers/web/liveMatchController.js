const LiveMatch = require("../../models/LiveMatch");
const { generateFlussonicLink } = require("../../utils");

// Get All Live Matches
const getAllLiveMatches = async () => {
  try {
    const liveMatches = await LiveMatch.find().populate("streaming_sources").sort({ position: "asc" });
    return {
      status: true,
      message: liveMatches.length === 0 ? "No live matches found!" : "Live matches fetched successfully!",
      data: liveMatches
    };
  } catch (error) {
    // throw new Error("Failed to get top league data!");
    return { status: false, message: "Something went wrong!" };
  }
};

// Get Single Live Matches
const getSingleLiveMatch = async (id) => {
  try {
    const liveMatch = await LiveMatch.findOne({ fixture_id: id }).populate({
      path: "streaming_sources",
      match: { stream_status: "1" },
      options: { sort: { position: 1 } }
    });

    if (liveMatch) {
      return {
        status: true,
        message: "Live match fetched successfully!",
        data: liveMatch
      };
    } else {
      return {
        status: false,
        message: "No live match found!"
      };
    }
  } catch (error) {
    return { status: false, message: "Something went wrong!" };
  }
};

// Get All Fixture Ids
const getFixturesIds = async () => {
  try {
    const fixtureIds = await LiveMatch.distinct("fixture_id", {
      fixture_id: { $nin: [null, ""] }
    });

    if (fixtureIds) {
      return {
        status: true,
        message: "Fixture Ids fetched successfully!",
        data: fixtureIds
      };
    } else {
      return {
        status: false,
        message: "No fixture Id found!"
      };
    }
  } catch (error) {
    return { status: false, message: "Something went wrong!" };
  }
};

// Get All Sources By Fixture Ids
const getSources = async (fixtureId, publicIP) => {
  try {
    const liveMatch = await LiveMatch.findOne({
      fixture_id: fixtureId
    }).populate({
      path: "streaming_sources",
      match: { stream_status: "1" },
      options: { sort: { position: 1 } }
    });

    const result = [];

    liveMatch?.streaming_sources?.map((streams) => {
      if (streams?.stream_type === "root_stream") {
        const rootStreams = streams.root_streams;

        if (rootStreams && rootStreams.length > 0) {
          // const randomIndex = Math.floor(Math.random() * rootStreams.length);
          // const randomRootStream = rootStreams[randomIndex];

          const embedCode = generateFlussonicLink(
            rootStreams[0]?.root_stream_stream_url,
            rootStreams[0]?.root_stream_stream_key,
            publicIP
          );

          result.push({
            title: streams.stream_title,
            link: `${embedCode}&remote=${publicIP}`
          });
        }
      } else {
        result.push({
          title: streams.stream_title,
          link: streams.stream_url
        });
      }
    });

    if (liveMatch) {
      return {
        status: true,
        message: "Sources fetched successfully!",
        data: result
      };
    } else {
      return {
        status: false,
        message: "No Sources found!"
      };
    }
  } catch (error) {
    console.log(error);
    return { status: false, message: "Something went wrong!" };
  }
};

module.exports = {
  getAllLiveMatches,
  getSingleLiveMatch,
  getFixturesIds,
  getSources
};
