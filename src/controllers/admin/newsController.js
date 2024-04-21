const { validationResult } = require("express-validator");
const { transformErrorsToMap, getSlugify, generateRandomId } = require("../../utils");
const cloudinaryUpload = require("../../helpers/cloudinaryUpload");
const News = require("../../models/News");

// Get All News
const getAllNews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      News.find({}).limit(limit).skip(skip).sort({ publishDate: "desc" }),
      News.countDocuments()
    ]);

    const hasNext = total > skip + limit;
    const hasPrev = page > 1;

    return res.json({
      status: true,
      message: "News fetched successfully!",
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

// Create A News
const createNews = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    const errorMessages = transformErrorsToMap(errors.array());

    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false, errors: errorMessages });
    }

    const { title, league, category, shortDescription, description, imageType, imageUrl, publishDate, status } =
      req.body;

    let uploadImageUrl = "";

    if (imageType === "image" && req.file) {
      uploadImageUrl = await cloudinaryUpload(req.file, "news");
    }

    const news = new News({
      title,
      league,
      category,
      slug: `${getSlugify(title)}-${generateRandomId(11)}`,
      shortDescription,
      description,
      imageType,
      image: imageType === "url" ? imageUrl : uploadImageUrl,
      publishDate,
      status
    });

    const savedNews = await news.save();

    return res.status(201).json({
      status: true,
      message: "News created successfully!",
      data: savedNews
    });
  } catch (error) {
    next(error);
  }
};

// Update A News
const updateNews = async (req, res, next) => {
  try {
    const id = req.params.newsId;
    const errors = validationResult(req);
    const errorMessages = transformErrorsToMap(errors.array());

    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false, errors: errorMessages });
    }

    const existingNews = await News.findById(id);

    if (!existingNews) {
      return res.status(404).json({ status: false, message: "News not found!" });
    }

    const { title, league, category, shortDescription, description, imageType, imageUrl, publishDate, status } =
      req.body;

    let uploadImageUrl = existingNews.image;

    if (imageType === "image" && req.file) {
      uploadImageUrl = await cloudinaryUpload(req.file, "news");
    }

    existingNews.title = title;
    existingNews.league = league;
    existingNews.category = category;
    // existingNews.slug = slug
    existingNews.shortDescription = shortDescription;
    existingNews.description = description;
    existingNews.imageType = imageType;
    existingNews.image = imageType === "url" ? imageUrl : uploadImageUrl;
    existingNews.publishDate = publishDate;
    existingNews.status = status;

    await existingNews.save();

    return res.json({
      status: true,
      message: "News updated successfully!",
      data: existingNews
    });
  } catch (error) {
    next(error);
  }
};
// Find Highlight by ID
const getNewsById = async (req, res, next) => {
  try {
    const id = req.params.newsId;
    console.log(id);
    const news = await News.findOne({ _id: id });

    if (!news) {
      return res.status(404).json({ status: false, message: "News not found!" });
    }

    return res.status(200).json({
      status: true,
      message: "News fetched successfully!",
      data: news
    });
  } catch (error) {
    next(error);
  }
};

const deleteNews = async (req, res, next) => {
  try {
    const id = req.params.newsId;
    const deletedNews = await News.findByIdAndDelete(id);

    if (!deletedNews) {
      return res.status(404).json({ status: false, message: "News not found!" });
    }

    res.status(200).json({
      status: true,
      message: "News deleted successfully!"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllNews,
  createNews,
  updateNews,
  deleteNews,
  getNewsById
};
