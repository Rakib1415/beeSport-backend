const GeneralSettings = require("../../models/GeneralSetting");

const getGenaralSetting = async (req, res, next) => {
  try {
    const generalSetting = await GeneralSettings.find();

    return res.status(200).json({ status: true, message: "General Setting fetched successfully", generalSetting });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

module.exports = {
  getGenaralSetting
};
