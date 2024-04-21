const Highlight = require("../../models/Highlight");

const getHighlightsByDate = async (req, res, next) => {
  try {
    const date = req.params.date;
    const { page = 1, limit = 10, category } = req.query;
    const skip = (page - 1) * limit;

    console.log("date: ", date);

    let formateDate = new Date(date).toISOString().replace("+00:00", "z");
    const query = {
      date: formateDate
    };

    if (category) {
      query.category = category;
    }

    console.log("query: ", query);

    const [docs, total] = await Promise.all([
      Highlight.find(query).limit(limit).skip(skip).sort({ createdAt: "desc" }),
      Highlight.find(query).countDocuments()
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

const getHighlightById = async (req, res, next) => {
  try {
    const fixtureId = req.params.fixtureId;
    const highlight = await Highlight.findOne({ fixtureId });

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

module.exports = {
  getHighlightsByDate,
  getHighlightById
};
