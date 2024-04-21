const { validationResult } = require("express-validator");
const News = require("../../models/News");
const { transformErrorsToMap } = require("../../utils");

const getSingleNews = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const news = await News.findOne({ slug });

    const relatedNews = await News.find({
      category: news.category,
      league: news.league,
      _id: { $ne: news.id }
    });

    if (news) {
      return res.json({
        status: true,
        message: "News fetched successfully!",
        data: {
          ...news._doc,
          relatedNews
        }
      });
    } else {
      return res.json({
        status: false,
        message: "No news found!"
      });
    }
  } catch (error) {
    next(error);
  }
};

const getGroupByLeague = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    const errorMessages = transformErrorsToMap(errors.array());

    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false, errors: errorMessages });
    }

    const { category } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }

    const news = await News.find(query).sort({ position: "asc" });

    const groupByLeagueArray = [];

    news.forEach((item) => {
      const existingCategory = groupByLeagueArray.find((group) => group.league === item.league);

      if (existingCategory) {
        existingCategory.news.push(item);
      } else {
        groupByLeagueArray.push({
          league: item.league,
          news: [item]
        });
      }
    });

    return res.json({
      status: true,
      message: groupByLeagueArray.length === 0 ? "No News found!" : "Group By News fetched successfully!",
      data: groupByLeagueArray
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSingleNews,
  getGroupByLeague
};
