const router = require("express").Router();
const geoip = require("geoip-lite");
const Banner = require("../../models/Banner");

/**
 * This function retrieves all ads from the database according to my current location.
 *
 * @param {req} req - The request object.
 * @param {res} res - The response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise<object>} A promise that resolves to the response object.
 */
router.get("/", async (req, res, next) => {
  try {
    if (!req.userIp) return res.status(400).send({ status: false, message: "No ip address" });
    // hard coded ip given need to trake from req.userIp
    // req.headers["cf-connecting-ip"] || req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
    const ip =
      process.env.NODE_ENV === "development"
        ? "103.60.175.26"
        : req.headers["cf-connecting-ip"] ||
          req.headers["x-real-ip"] ||
          req.headers["x-forwarded-for"] ||
          req.socket.remoteAddress ||
          "";
    const geo = geoip.lookup(ip);

    const banners = await Banner.find({ country: geo.country });
    if (banners.length === 0) {
      return res.status(200).send({ status: false, message: "No banners found for this country", banner: [] });
    }

    const randomIndex = Math.floor(Math.random() * banners.length);
    const randomBanner = banners[randomIndex];

    return res.status(200).send({ status: true, banner: randomBanner });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
