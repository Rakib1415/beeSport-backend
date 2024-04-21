const { validationResult } = require("express-validator");
const { transformErrorsToMap, isValidJSON } = require("../../utils");
const cloudinaryUpload = require("../../helpers/cloudinaryUpload");
const Highlight = require("../../models/Highlight");

// Get All Highlights
const getHighlights = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      Highlight.find({}).limit(limit).skip(skip).sort({ createdAt: "desc" }),
      Highlight.countDocuments()
    ]);

    const hasNext = total > skip + limit;
    const hasPrev = page > 1;

    res.status(200).json({
      status: true,
      message: "Highlights fetched successfully!",
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
    next(error);
  }
};

// Create A Highlight
const createHighlight = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    const errorMessages = transformErrorsToMap(errors.array());

    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false, errors: errorMessages });
    }

    const {
      title,
      category,
      date,
      videoType,
      youtubeUrl,
      thumbnailImageType,
      thumbnailImageUrl,
      fixtureId,
      sources,
      status
    } = req.body;

    let uploadImageUrl = "";

    if (thumbnailImageType === "image" && req.file) {
      uploadImageUrl = await cloudinaryUpload(req.file, "highlights");
    }

    const highlight = new Highlight({
      title,
      category,
      date,
      videoType,
      youtubeUrl,
      thumbnailImageType,
      thumbnailImage: thumbnailImageType === "url" ? thumbnailImageUrl : uploadImageUrl,
      fixtureId,
      sources: sources && isValidJSON(sources) ? JSON.parse(sources) : null,
      status
    });

    const savedHighlight = await highlight.save();

    res.status(201).json({
      status: true,
      message: "Highlight created successfully!",
      data: savedHighlight
    });
  } catch (error) {
    next(error);
  }
};

// Update A Highlight
const updateHighlight = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    const errorMessages = transformErrorsToMap(errors.array());

    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false, errors: errorMessages });
    }

    const id = req.params.highlightId;
    const {
      title,
      category,
      date,
      videoType,
      youtubeUrl,
      thumbnailImageType,
      thumbnailImageUrl,
      fixtureId,
      sources,
      status
    } = req.body;

    const existingHighlight = await Highlight.findById(id);

    if (!existingHighlight) {
      return res.status(404).json({ status: false, message: "Highlight not found!" });
    }

    let uploadImageUrl = existingHighlight.thumbnailImage;

    if (thumbnailImageType === "image" && req.file) {
      uploadImageUrl = await cloudinaryUpload(req.file, "highlights");
      await cloudinaryUpload(null, existingHighlight.thumbnailImage, "delete");
    }

    existingHighlight.title = title;
    existingHighlight.category = category;
    existingHighlight.date = date;
    existingHighlight.videoType = videoType;
    existingHighlight.youtubeUrl = youtubeUrl;
    existingHighlight.thumbnailImageType = thumbnailImageType;
    existingHighlight.thumbnailImage = thumbnailImageType === "url" ? thumbnailImageUrl : uploadImageUrl;
    existingHighlight.fixtureId = fixtureId;
    existingHighlight.sources = sources && isValidJSON(sources) ? JSON.parse(sources) : null;
    existingHighlight.status = status;

    await existingHighlight.save();

    return res.status(201).json({
      status: true,
      message: "Highlight updated successfully!",
      data: existingHighlight
    });
  } catch (error) {
    next(error);
  }
};

// Find Highlight by ID
const getHighlightById = async (req, res, next) => {
  try {
    const id = req.params.highlightId;
    const highlight = await Highlight.findOne({ _id: id });

    if (!highlight) {
      return res.status(404).json({ status: false, message: "Highlight not found!" });
    }

    return res.json({
      status: true,
      message: "Highlight fetched successfully!",
      data: highlight
    });
  } catch (error) {
    next(error);
  }
};

const deleteHighlight = async (req, res, next) => {
  try {
    const id = req.params.highlightId;
    const deletedHighlight = await Highlight.findByIdAndDelete(id);

    if (!deletedHighlight) {
      return res.status(404).json({ status: false, message: "Highlight not found!" });
    }

    if (deletedHighlight.thumbnailImageType === "image") {
      await cloudinaryUpload(null, deletedHighlight.thumbnailImage, "delete");
    }

    return res.json({
      status: true,
      message: "Highlight deleted successfully!"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHighlights,
  createHighlight,
  updateHighlight,
  deleteHighlight,
  getHighlightById
};
