const { generateFlussonicToken } = require("../../helpers/generateFlussonicToken");
const { shuffle } = require("../../helpers/shuffleArray");
const LiveMatch = require("../../models/LiveMatch");
const Stream = require("../../models/Stream");
const { exclude } = require("../../utils");

const getStreamingSources = async (reqBody, userIp) => {
  try {
    const { match_id, platform } = reqBody;
    const match = await LiveMatch.findOne({ id: match_id });

    if (!match) {
      throw new Error("Match not found for the provided match_id");
    }

    // if (!match.apps.includes(app_id)) {
    //   throw new Error("The provided app_id is not associated with this match");
    // }

    const streamingSources = match.streaming_sources;

    const filter = platform
      ? {
          _id: { $in: streamingSources },
          $or: [{ platform: platform.toLowerCase() }, { platform: "both" }]
        }
      : { _id: { $in: streamingSources } };

    const streamingSourcesData = await Stream.find(filter);

    const filteredStreamingSources = streamingSourcesData
      .filter((source) => source.stream_status === "1")
      .sort((a, b) => a.position - b.position)
      .map((source) => {
        const sourceObj = source.toObject();

        if (sourceObj?.stream_type === "root_stream") {
          const streams = sourceObj?.root_streams.filter((stream) => stream.root_stream_status === "1");

          if (streams.length > 0) {
            const shuffled_stream = shuffle(streams);
            sourceObj.stream_url = generateFlussonicToken(
              shuffled_stream[0].root_stream_stream_url,
              shuffled_stream[0].root_stream_stream_key,
              userIp
            );
          }
        }

        exclude(sourceObj, ["_id", "__v", "matchId", "stream_status", "root_streams"]);
        return sourceObj;
      });

    return filteredStreamingSources;
  } catch (error) {
    console.error("Error getting streaming sources:", error);
    throw new Error("Failed to fetch streaming sources");
  }
};

module.exports = { getStreamingSources };
