const GeneralSettings = require("../../models/GeneralSetting");

const getAllowedStates = async (req, res) => {
  try {
    const generalSetting = await GeneralSettings.findOne();
    countryShortList = generalSetting.allowed_country.map((country) => country.value);

    res.json({
      status: true,
      message: "Allowed State ",
      data: countryShortList
    });
  } catch (error) {
    console.log(error);
    res.json({ status: false, message: "Something went wrong!" });
  }
};

module.exports = {
  getAllowedStates
};
