const { validationResult } = require("express-validator");
const PopularLeague = require("../../models/PopularLeague");

const getAllLeague = async (req, res, next) => {
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
const createLeague = async (req, res, next) => {
  console.log(req.body);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false, errors: errors.array() });
    }

    const { name, id, image_path, country, currentSeason, category } = req.body;

    const existingLeagues = await PopularLeague.findOne({
      $and: [{ currentSeason: currentSeason }, { name: name }]
    });

    if (existingLeagues) {
      return res.status(200).json({
        status: false,
        message: "This league already added!"
      });
    }

    const popularLeague = new PopularLeague({
      id,
      name,
      image_path,
      country,
      category,
      currentSeason
    });

    const savedLeague = await popularLeague.save();

    res.status(201).json({
      status: true,
      message: "League Added successfully!",
      data: savedLeague
    });
  } catch (error) {
    next(error);
  }
};

const deleteLeague = async (req, res, next) => {
  try {
    const id = req.params.leagueId;
    const deletedLeague = await PopularLeague.findByIdAndDelete(id);

    if (!deletedLeague) {
      return res.status(404).json({ status: false, message: "News not found!" });
    }

    res.status(200).json({
      status: true,
      message: "League deleted successfully!"
    });
  } catch (error) {
    next(error);
  }
};

const updatePointTable = async (req, res, next) => {
  try {
    const { id } = req.body;

    await PopularLeague.updateMany({}, { show_point_table: 0 });

    await PopularLeague.updateOne(
      {
        id: id
      },
      {
        show_point_table: 1
      }
    );

    res.status(201).json({
      status: true,
      message: "Select point table successfully!"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  deleteLeague,
  createLeague,
  getAllLeague,
  updatePointTable
};
