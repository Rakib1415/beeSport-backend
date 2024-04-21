const { body, param } = require("express-validator");
const {
  createTipSter,
  updateTipSter,
  allTipSter,
  singleTipSter,
  deleteTipSter
} = require("../../controllers/admin/tipSterController");
const router = require("express").Router();

const multer = require("multer");
const upload = multer();

const validation = [
  body("name").isEmpty().withMessage("Name is required"),
  body("image").isEmpty().withMessage("Image is required"),
  body("link").optional(),
  body("country").isEmpty().withMessage("Country is required")
];

/**
 * Creates a TipSter for a specific country.
 * Middleware 'userAuth' is used to authenticate the user.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Response} Returns JSON response indicating the status and votes for the fixture.
 */
router.post("", validation, upload.single("image"), createTipSter);

/**
 * Retrieves the tipsters .
 * Middleware 'userAuth' is used to authenticate the user.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Response} Returns JSON response indicating the status and votes for the fixture.
 */
router.get("", allTipSter);

/**
 * Single tipster.
 * Middleware 'userAuth' is used to authenticate the user.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Response} Returns JSON response indicating the status and updated votes for the fixture.
 */
router.get("/:id", singleTipSter);

/**
 * Updates the tipster for a specific fixture identified by its ID.
 * Middleware 'userAuth' is used to authenticate the user.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Response} Returns JSON response indicating the status and votes for the fixture.
 */
router.put(
  "/:id",
  [param("id").isMongoId().withMessage("Please provide a valid id"), ...validation],
  upload.single("image"),
  updateTipSter
);

/**
 * Registers a user's vote for a specific fixture.
 * Middleware 'userAuth' is used to authenticate the user.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Response} Returns JSON response indicating the status and updated votes for the fixture.
 */
router.delete("/:id", deleteTipSter);

module.exports = router;
