const { validationResult } = require("express-validator");
const { transformErrorsToMap } = require("../../utils");
const NewsLeague = require("../../models/NewsLeague");

// Get All News League
const getAllNewsLeague = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      NewsLeague.find({}).limit(limit).skip(skip).sort({ createdAt: "desc" }),
      NewsLeague.countDocuments()
    ]);

    const hasNext = total > skip + limit;
    const hasPrev = page > 1;

    return res.json({
      status: true,
      message: "News League fetched successfully!",
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

// Create A News League
const createNewsLeague = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    const errorMessages = transformErrorsToMap(errors.array());

    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false, errors: errorMessages });
    }

    const { name, status } = req.body;

    const existingNewsLeague = await NewsLeague.findOne({ name });

    if (existingNewsLeague) {
      return res.status(200).json({
        status: false,
        message: "This league already added!"
      });
    }

    const newsLeague = new NewsLeague({
      name,
      status
    });

    const savedNewsLeague = await newsLeague.save();

    res.status(201).json({
      status: true,
      message: "News League created successfully!",
      data: savedNewsLeague
    });
  } catch (error) {
    next(error);
  }
};

// Update A News League
const updateNewsLeague = async (req, res, next) => {
  try {
    const id = req.params.newsLeagueId;
    const errors = validationResult(req);
    const errorMessages = transformErrorsToMap(errors.array());

    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false, errors: errorMessages });
    }

    const { name, status } = req.body;

    const existingNewsLeague = await NewsLeague.findById(id);

    if (!existingNewsLeague) {
      return res.status(404).json({ status: false, message: "News league not found!" });
    }

    // Check if another League with the same name already exists
    const existingLeaguesWithSameName = await NewsLeague.findOne({
      name,
      _id: { $ne: id }
    });

    if (existingLeaguesWithSameName) {
      return res.status(200).json({
        status: false,
        message: "News League name already exists!"
      });
    }

    const updatedNews = await NewsLeague.findByIdAndUpdate(
      id,
      {
        name,
        status
      },
      {
        new: true
      }
    );

    res.status(201).json({
      status: true,
      message: "League updated successfully!",
      data: updatedNews
    });
  } catch (error) {
    next(error);
  }
};

// Find News League by ID
const getNewsLeagueById = async (req, res, next) => {
  try {
    const id = req.params.newsLeagueId;
    const newsLeague = await NewsLeague.findOne({ _id: id });

    if (!newsLeague) {
      return res.status(404).json({ status: false, message: "News league not found!" });
    }

    res.status(200).json({
      status: true,
      message: "News league fetched successfully!",
      data: newsLeague
    });
  } catch (error) {
    next(error);
  }
};

const deleteNewsLeague = async (req, res, next) => {
  try {
    const id = req.params.newsLeagueId;
    const deletedNewsLeague = await NewsLeague.findByIdAndDelete(id);

    if (!deletedNewsLeague) {
      return res.status(404).json({ status: false, message: "News league not found!" });
    }

    res.status(200).json({
      status: true,
      message: "News League deleted successfully!"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllNewsLeague,
  createNewsLeague,
  updateNewsLeague,
  deleteNewsLeague,
  getNewsLeagueById
};
