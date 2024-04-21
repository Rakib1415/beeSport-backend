const TipSter = require("../../models/TipSter");
const geoip = require("geoip-lite");
const getTipSter = async (req, res, next) => {
  try {
    const ip =
      process.env.NODE_ENV === "development"
        ? "103.60.175.26"
        : req.headers["cf-connecting-ip"] ||
          req.headers["x-real-ip"] ||
          req.headers["x-forwarded-for"] ||
          req.socket.remoteAddress ||
          "";
    const geo = geoip.lookup(ip);
    if (!geo || !geo.country) {
      throw new Error("Unable to determine country from IP address");
    }

    const tipSter = await TipSter.find({ country: geo.country });

    return res.status(200).json({ status: true, message: "TipSter fetched successfully", tipSter });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

module.exports = { getTipSter };
