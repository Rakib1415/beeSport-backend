const { validationResult } = require("express-validator");
const { createStreaming } = require("../../services/matchServices");
const LiveMatch = require("../../models/LiveMatch");
const Stream = require("../../models/Stream");
const { generateRandomId, getPublicId } = require("../../utils");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const CloudinaryStorage = require("multer-storage-cloudinary").CloudinaryStorage;

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "asia-sports/live-match", // optional: specify a folder in Cloudinary
    allowed_formats: ["jpg", "png", "jpeg"]
    // public_id: (req, file) => `${file.fieldname.replace(fileExt, "").toLowerCase().split(" ").join("-") + Date.now()}`
  }
});

// const storage = multer.diskStorage({
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   },
// });

const upload = multer({
  storage,
  limits: {
    fileSize: 5000000 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedImageTypes = ["image/png", "image/jpg", "image/jpeg"];
    const validMimeType = allowedImageTypes.includes(file.mimetype);

    if ((file.fieldname === "team_one_image" || file.fieldname === "team_two_image") && validMimeType) {
      cb(null, true);
    } else {
      cb(new Error("Only .jpg, .png, or .jpeg format allowed!"));
    }
  }
});

async function createMatch(req, res, next) {
  try {
    upload.fields([
      {
        name: "team_one_image",
        maxCount: 1
      },
      {
        name: "team_two_image",
        maxCount: 1
      }
    ])(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        console.error(err);
        return res.status(500).json({ error: "Multer error!" });
      } else if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error uploading file!" });
      }

      // const errors = validationResult(req);
      // if (!errors.isEmpty()) {
      //   return res.status(400).json({ status: false, errors: errors.array() });
      // }

      const matchData = req.body;
      const streamingData = createStreaming(JSON.parse(matchData.streaming_sources));

      if (matchData?.team_one_image_type === "image") {
        matchData.team_one_image = req.files?.team_one_image[0].path || null;
      } else {
        matchData.team_one_image = matchData?.team_one_image_url;
      }

      if (matchData?.team_two_image_type === "image") {
        matchData.team_two_image = req.files?.team_two_image[0].path || null;
      } else {
        matchData.team_two_image = matchData?.team_two_image_url;
      }

      const newMatch = new LiveMatch({
        ...matchData,
        streaming_sources: []
      });

      const createdStreams = await Promise.all(
        streamingData.map(async (streamData) => {
          const newStream = new Stream({
            id: generateRandomId(15),
            matchId: newMatch._id,
            match_id: newMatch.id,
            ...streamData
          });

          newMatch.streaming_sources.push(newStream._id);
          await newStream.save();
          return newStream;
        })
      );

      await newMatch.save();

      return res.status(200).json({
        status: true,
        message: "Match created successfully!",
        data: { match: newMatch, streams: createdStreams }
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "An error occurred while creating the match!"
    });
  }
}

async function updateMatch(req, res, next) {
  try {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   return res.status(400).json({ status: false, errors: errors.array() });
    // }

    upload.fields([
      {
        name: "team_one_image",
        maxCount: 1
      },
      {
        name: "team_two_image",
        maxCount: 1
      }
    ])(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        console.error(err);
        return res.status(500).json({ error: "Multer error!" });
      } else if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error uploading file!" });
      }

      const matchId = req.params.matchId;
      const matchData = req.body;

      const existingMatch = await LiveMatch.findOne({ id: matchId });

      if (!existingMatch) {
        return res.status(404).json({ status: false, message: "Live Match not found!" });
      }

      await Stream.deleteMany({ match_id: existingMatch.id });

      // const date = moment(matchData.time);
      // const timestamp = date.valueOf() / 1000;
      // const match_time = new Date(matchData.time).getTime().toString();

      if (matchData?.team_one_image_type === "image") {
        // Delete Previous Image From Cloudinary
        if (req?.files?.team_one_image) {
          const publicId = getPublicId(existingMatch.team_two_image, "asia-sports");

          cloudinary.uploader.destroy(`asia-sports/${publicId}`).then((err) => {
            console.log(err);
          });
        }

        existingMatch.team_one_image = req?.files?.team_one_image
          ? req?.files?.team_one_image[0]?.path
          : matchData?.team_one_image_url;
      } else {
        existingMatch.team_one_image = matchData?.team_one_image_url;
      }

      if (matchData?.team_two_image_type === "image") {
        // Delete Previous Image From Cloudinary
        if (req?.files?.team_two_image) {
          const publicId = getPublicId(existingMatch.team_two_image, "asia-sports");

          cloudinary.uploader.destroy(`asia-sports/${publicId}`).catch((err) => {
            console.log(err);
          });
        }

        existingMatch.team_two_image = req?.files?.team_two_image
          ? req?.files?.team_two_image[0]?.path
          : matchData?.team_two_image_url;
      } else {
        existingMatch.team_two_image = matchData?.team_two_image_url;
      }

      // Update match fields
      existingMatch.match_title = matchData.match_title;
      existingMatch.time = matchData.time;
      existingMatch.match_time = matchData.match_time;
      existingMatch.fixture_id = matchData.fixture_id;
      existingMatch.sports_type = matchData.sports_type;
      existingMatch.sports_type_name = matchData.sports_type_name;
      existingMatch.is_hot = matchData.is_hot;
      existingMatch.status = matchData.status;
      existingMatch.team_one_name = matchData.team_one_name;
      existingMatch.team_two_name = matchData.team_two_name;
      existingMatch.streaming_sources = [];

      const streamingData = createStreaming(JSON.parse(matchData.streaming_sources));

      await Promise.all(
        streamingData.map(async (streamData) => {
          const newStream = new Stream({
            id: generateRandomId(15),
            matchId: existingMatch._id,
            match_id: existingMatch.id,
            ...streamData
          });

          existingMatch.streaming_sources.push(newStream._id);
          await newStream.save();
          return newStream;
        })
      );

      await existingMatch.save();

      return res.status(200).json({
        status: true,
        message: "Live Match and Streams updated successfully!",
        match: existingMatch
      });
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

// Get Single Match With Stream
async function getMatchWithStreams(req, res, next) {
  try {
    const matchId = req.params.matchId;

    const match = await LiveMatch.findOne({ id: matchId }).populate("streaming_sources");

    if (!match) {
      return res.status(404).json({ status: false, message: "Live Match not found!" });
    }

    return res.status(200).json({ status: true, data: match });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

async function getAllMatches(req, res, next) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // console.log("page: ", page);
    // console.log("limit: ", limit);
    // console.log("skip: ", skip);

    const [docs, total] = await Promise.all([
      LiveMatch.find({})
        .limit(limit)
        .skip(skip)
        .sort({ position: "asc" })
        .populate({ path: "streaming_sources", options: { sort: { position: "asc" } } }),
      LiveMatch.countDocuments()
    ]);

    const hasNext = total > skip + limit;
    const hasPrev = page > 1;

    return res.status(200).json({
      status: true,
      message: "Live matches paginated data fetched successfully!",
      data: {
        docs,
        page: +page,
        limit: +limit,
        totalPage: Math.ceil(total / limit),
        totalDocs: total,
        hasNext,
        hasPrev
      }
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

async function deleteMatchWithStreams(req, res, next) {
  try {
    const matchId = req.params.matchId; // Assuming you're passing the match ID as a URL parameter

    const existingMatch = await LiveMatch.findOne({ id: matchId });

    if (!existingMatch) {
      return res.status(404).json({ status: false, message: "Live Match not found!" });
    }

    // Delete Previous Image From Cloudinary
    if (existingMatch?.toObject().team_one_image_type === "image") {
      const publicId = getPublicId(existingMatch.team_one_image, "asia-sports");

      cloudinary.uploader.destroy(`asia-sports/${publicId}`).catch((err) => {
        console.log(err);
      });
    }

    // Delete Previous Image From Cloudinary
    if (existingMatch?.toObject().team_two_image_type === "image") {
      const publicId = getPublicId(existingMatch.team_two_image, "asia-sports");

      cloudinary.uploader.destroy(`asia-sports/${publicId}`).catch((err) => {
        console.log(err);
      });
    }

    // Delete associated streams
    await Stream.deleteMany({ match_id: matchId });

    // Delete the match
    await LiveMatch.deleteOne({ id: matchId });

    return res.status(200).json({
      status: true,
      message: "Live match deleted successfully!"
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

// Sort By Position
async function sortMatch(req, res, next) {
  try {
    const matchData = req.body;

    await Promise.all(
      matchData.map(async (match) => {
        const liveMatch = await LiveMatch.findById(match._id);
        liveMatch.position = match.position;
        await liveMatch.save();

        return liveMatch;
      })
    );

    return res.status(200).json({
      status: true,
      message: "Live Match Sorted Successfully!"
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

async function sortStreamingSource(req, res, next) {
  try {
    const sourceData = req.body;

    await Promise.all(
      sourceData.map(async (source) => {
        const streamSources = await Stream.findByIdAndUpdate(source._id, {
          position: source.position
        });
        return streamSources;
      })
    );

    return res.status(200).json({
      status: true,
      message: "Stream Source Sorted Successfully!"
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

module.exports = {
  createMatch,
  updateMatch,
  getMatchWithStreams,
  getAllMatches,
  deleteMatchWithStreams,
  sortStreamingSource,
  sortMatch
};
