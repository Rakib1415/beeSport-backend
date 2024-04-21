const express = require("express");
const router = express.Router();
const { body, param, validationResult } = require("express-validator");
const {
  createApp,
  getApp,
  getSingleApp,
  updateSingleApp,
  deleteSingleApp
} = require("../../controllers/admin/manageAppController");

// Validation middleware
const validateCreateApp = [
  body("app_name").notEmpty().withMessage("app_name is required"),
  body("app_unique_id").notEmpty().withMessage("app_unique_id is required")
];

const validateSingleApp = [param("appId").notEmpty().withMessage("App unique ID is required")];

// Get all apps
router.get("/", async (req, res, next) => {
  try {
    const apps = await getApp();
    res.status(200).json(apps);
  } catch (error) {
    next(error);
  }
});

// Create an app
router.post("/create", validateCreateApp, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false, errors: errors.array() });
    }

    const appInfo = req.body;
    const app = await createApp(appInfo);

    res.status(201).json(app);
  } catch (error) {
    next(error);
  }
});

// Get single app
router.get("/:appId", validateSingleApp, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false, errors: errors.array() });
    }
    const appId = req.params.appId;
    const app = await getSingleApp(appId);

    res.status(200).json(app);
  } catch (error) {
    next(error);
  }
});

// Update single app
router.put("/:appId", validateSingleApp, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false, errors: errors.array() });
    }
    const appId = req.params.appId;
    const appData = req.body;
    const app = await updateSingleApp({ appId, appData });

    res.status(200).json(app);
  } catch (error) {
    next(error);
  }
});

// Delete single app
router.delete("/:appId", validateSingleApp, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false, errors: errors.array() });
    }
    const appId = req.params.appId;
    const app = await deleteSingleApp(appId);

    res.status(200).json(app);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
