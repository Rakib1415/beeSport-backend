const { getTipSter } = require("../../controllers/web/tipSterController");
const router = require("express").Router();

/**
 * Single tipster.
 * Middleware 'userAuth' is used to authenticate the user.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Response} Returns JSON response indicating the status and updated votes for the fixture.
 */
router.get("/", getTipSter);

module.exports = router;
