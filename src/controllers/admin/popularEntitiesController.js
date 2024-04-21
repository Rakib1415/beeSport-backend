const { validationResult } = require("express-validator");
const PopularEntity = require("../../models/PopularEntity");
const { transformErrorsToMap } = require("../../utils");

const entityMapping = {
  football: {
    leagues: "footballLeagues",
    teams: "footballTeams",
    players: "footballPlayers"
  },
  cricket: {
    leagues: "cricketLeagues",
    teams: "cricketTeams",
    players: "cricketPlayers"
  }
};
const sportsList = ["football", "cricket"];
const entities = ["leagues", "teams", "players"];

// Get Popular Football Entities
const getPopularEntities = async (req, res, next) => {
  try {
    const popularEntity = await PopularEntity.findOne();

    if (!popularEntity) {
      return res.status(200).json({
        status: false,
        message: "No football leagues found!"
      });
    }

    const { sports, entity } = req.params;

    if (!sportsList.includes(sports) || !entities.includes(entity)) {
      return res.json({
        status: false,
        message: "Invalid sports or entity!"
      });
    }

    const popularFootballLeagues = popularEntity[entityMapping[sports][entity]];

    return res.json({
      status: true,
      message: `${sports.charAt(0).toUpperCase() + sports.slice(1)} ${entity} fetched successfully!`,
      data: popularFootballLeagues
    });
  } catch (error) {
    next(error);
  }
};

// Delete Popular Football Entities
const deletePopularEntity = async (req, res, next) => {
  try {
    const { id, sports, entity } = req.params;

    if (!sportsList.includes(sports) || !entities.includes(entity)) {
      return res.json({
        status: false,
        message: "Invalid sports or entity!"
      });
    }

    const entityList = entityMapping[sports][entity];

    await PopularEntity.updateOne(
      {},
      {
        $pull: { [entityList]: { id } }
      },
      {
        new: true
      }
    );

    return res.json({
      status: true,
      message: `${sports.charAt(0).toUpperCase() + sports.slice(1)} ${entity} deleted successfully!`
    });
  } catch (error) {
    next(error);
  }
};

// Create Popular Football League Entities
const createPopularEntity = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    const errorMessages = transformErrorsToMap(errors.array());

    if (!errors.isEmpty()) {
      return res.json({ status: false, errors: errorMessages });
    }

    const { sports, entity, id, name, logo, country, currentSeason } = req.body;
    const entityList = entityMapping[sports][entity];

    const isDocumentExist = await PopularEntity.findOne({});

    if (!isDocumentExist) {
      await PopularEntity.create({
        [entityList]: [{ id, name, logo, country, currentSeason }]
      });
    } else {
      const identity = `${entityList}.id`;

      const isExists = await PopularEntity.findOne({
        [identity]: id // example: "footballLeagues.id" : "id"
      });

      if (!isExists) {
        await PopularEntity.updateOne(
          {},
          {
            $push: { [entityList]: { id, name, logo, country, currentSeason } }
          },
          {
            new: true
          }
        );
      }
    }

    return res.json({
      status: true,
      message: `${sports.charAt(0).toUpperCase() + sports.slice(1)} ${entity} added successfully!`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPopularEntities,
  deletePopularEntity,
  createPopularEntity
};
