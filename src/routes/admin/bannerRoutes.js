// external imports
const router = require("express").Router();
const multer = require("multer");
const upload = multer();

// intrenal imports
const { userAuth } = require("../../middlewares/userAuth");
const Banner = require("../../models/Banner");
const cloudinaryUpload = require("../../helpers/cloudinaryUpload");

/**
 * This route is used to create a ad for mobile app
 * ad will be of 2 types 1 is small and another is large
 * there can also be one interstitial ad
 * @param {string} country - country for which the ad should be shown
 * @param req.files.smallBanner - the small ad that will be stored in @param BannerModel.banner.small
 * @param req.files.largeBanner - the large ad that will be stored in @param BannerModel.banner.large
 * @param req.files.interstitial - the interstitial ad that will be stored in @param BannerModel.interstitial
 * @returns {Promise<object>} A promise that resolves to the response object.
 */

//upload fields set for multer file upload
const bannerUpload = upload.fields([
  { name: "smallBanner", maxCount: 1 },
  { name: "largeBanner", maxCount: 1 },
  { name: "interstitial", maxCount: 1 }
]);
router.post("/", userAuth, bannerUpload, async (req, res, next) => {
  try {
    if (
      !req.body.country ||
      !(
        req.files.smallBanner ||
        req.body.smallBanner ||
        req.files.largeBanner ||
        req.body.largeBanner ||
        req.files.interstitial ||
        req.body.interstitial
      )
    ) {
      return res.status(400).send({ status: false, message: "Bad Request" });
    }

    const bannerData = {};

    // Handle small banner
    if (req.files.smallBanner || req.body.smallBanner) {
      bannerData.small = {
        image: req.files.smallBanner
          ? await cloudinaryUpload(req.files.smallBanner[0], "banner")
          : req.body.smallBanner,
        action: req.body.smallAction
      };
    }

    // Handle large banner
    if (req.files.largeBanner || req.body.largeBanner) {
      bannerData.large = {
        image: req.files.largeBanner
          ? await cloudinaryUpload(req.files.largeBanner[0], "banner")
          : req.body.largeBanner,
        action: req.body.largeAction
      };
    }

    // Handle interstitial
    if (req.files.interstitial || req.body.interstitial) {
      req.body.interstitial = {
        image: req.files.interstitial
          ? await cloudinaryUpload(req.files.interstitial[0], "banner")
          : req.body.interstitial,
        action: req.body.interstitialAction
      };
    }

    // Create banner object
    const banner = await Banner.create({
      country: req.body.country,
      banner: bannerData,
      interstitial: req.body.interstitial
    });

    // Send response
    if (banner) {
      res.status(201).send({ status: true, banner });
    } else {
      res.status(404).send({ status: false, message: "Banner not created!" });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

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
    const banners = await Banner.find();
    if (banners.length === 0) {
      return res.status(200).send({ status: false, message: "No banners found", banner: [] });
    }

    return res.status(200).send({ status: true, banner: banners });
  } catch (error) {
    console.log(error);
    next(error);
  }
});
/**
 * This function retrieves all ads from the database according to my current location.
 *
 * @param {req} req - The request object.
 * @param {res} res - The response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise<object>} A promise that resolves to the response object.
 */
router.get("/:id", async (req, res, next) => {
  const id = req.params.id;
  try {
    const banners = await Banner.findById({ _id: id });
    if (banners.length === 0) {
      return res.status(200).send({ status: false, message: "No banners found", banner: [] });
    }

    return res.status(200).send({ status: true, banner: banners });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

/**
 * This function updates a ad in the database.
 * @param {string} id - The ID of the ad
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise<object>} A promise that resolves to the response object.
 */
router.put("/:id", userAuth, bannerUpload, async (req, res, next) => {
  try {
    if (!req.files || !req.body.country || !req.params.id) {
      return res.status(400).send({ status: false, message: "Bad Request" });
    }
    const bannerData = {};

    // Handle small banner
    if (req.files.smallBanner || req.body.smallBanner) {
      bannerData.small = {
        image: req.files.smallBanner
          ? await cloudinaryUpload(req.files.smallBanner[0], "banner")
          : req.body.smallBanner,
        action: req.body.smallAction
      };
    }

    // Handle large banner
    if (req.files.largeBanner || req.body.largeBanner) {
      bannerData.large = {
        image: req.files.largeBanner
          ? await cloudinaryUpload(req.files.largeBanner[0], "banner")
          : req.body.largeBanner,
        action: req.body.largeAction
      };
    }

    // Handle interstitial
    if (req.files.interstitial || req.body.interstitial) {
      req.body.interstitial = {
        image: req.files.interstitial
          ? await cloudinaryUpload(req.files.interstitial[0], "banner")
          : req.body.interstitial,
        action: req.body.interstitialAction
      };
    }

    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.status(200).send({ status: true, banner });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

/**
 * This function deletes a ad in the database.
 * @param {string} id - The ID of the ad
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise<object>} A promise that resolves to the response object.
 */
router.delete("/:id", userAuth, async (req, res, next) => {
  try {
    if (!req.params.id) {
      return res.status(400).send({ status: false, message: "Bad Request" });
    }
    let banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).send({ status: false, message: "Banner not found!" });
    }
    const deletePromises = [];
    if (banner.banner.small) {
      deletePromises.push(cloudinaryUpload(banner.banner.small, "ad", "delete"));
    }
    if (banner.banner.large) {
      deletePromises.push(cloudinaryUpload(banner.banner.large, "ad", "delete"));
    }
    if (banner.interstitial) {
      deletePromises.push(cloudinaryUpload(banner.interstitial, "ad", "delete"));
    }
    banner = await Banner.findByIdAndDelete(req.params.id);
    banner
      ? res.status(200).send({ status: true, banner, message: "Banner delete successfully" })
      : res.status(404).send({ status: false, message: "Banner not deleted!" });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
