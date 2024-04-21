const { body, param } = require("express-validator");
const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");
const Subscription = require("../../models/Subscription");
const { transformErrorsToMap } = require("../../utils");

// validation
const validateCreateAdsType = [
  body("title").notEmpty().withMessage("Title is required!"),
  body("duration_type").notEmpty().withMessage("Duration type is required!"),
  body("duration").notEmpty().withMessage("Duration is required!"),
  body("price").notEmpty().withMessage("Price date is required!"),
  body("status").notEmpty().withMessage("Status is required!"),
  body("descriptions").notEmpty().withMessage("Description is required!")
];

const validateSingleNews = [param("subscriptionId").notEmpty().withMessage("Subscription ID is required!")];

// Get All News
router.get("/", async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find();

    res.status(200).json({
      status: true,
      message: subscriptions.length === 0 ? "No subscription found!" : "Subscription fetched successfully!",
      data: subscriptions
    });
  } catch (error) {
    next(error);
  }
});

// Create A Subscription
router.post("/create", validateCreateAdsType, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    const errorMessages = transformErrorsToMap(errors.array());

    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false, errors: errorMessages });
    }

    const { title, duration_type, duration, price, status, descriptions } = req.body;

    const subscription = new Subscription({
      title,
      duration_type,
      duration,
      price,
      status,
      descriptions
    });

    const savedSubscription = await subscription.save();

    res.status(201).json({
      status: true,
      message: "Subscription created successfully!",
      data: savedSubscription
    });
  } catch (error) {
    next(error);
  }
});

// Find News by ID
router.get("/:subscriptionId", validateSingleNews, async (req, res, next) => {
  try {
    const id = req.params.subscriptionId;
    const subscription = await Subscription.findById(id);

    if (!subscription) {
      return res.status(404).json({ status: false, message: "Subscription not found!" });
    }

    res.status(200).json({
      status: true,
      message: "Subscription fetched successfully!",
      data: subscription
    });
  } catch (error) {
    next(error);
  }
});

// Update News by Id
router.put("/:subscriptionId", validateCreateAdsType, async (req, res, next) => {
  try {
    const id = req.params.subscriptionId;
    const errors = validationResult(req);
    const errorMessages = transformErrorsToMap(errors.array());

    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false, errors: errorMessages });
    }

    const { title, duration_type, duration, price, status, descriptions } = req.body;

    const updatedSubscription = await Subscription.findByIdAndUpdate(
      id,
      {
        title,
        duration_type,
        duration,
        price,
        status,
        descriptions
      },
      {
        new: true
      }
    );

    res.status(201).json({
      status: true,
      message: "Subscription updated successfully!",
      data: updatedSubscription
    });
  } catch (error) {
    next(error);
  }
});

// Delete a Subscription by Id
router.delete("/:subscriptionId", validateSingleNews, async (req, res, next) => {
  try {
    const id = req.params.subscriptionId;
    const deletedSubscription = await Subscription.findByIdAndDelete(id);

    if (!deletedSubscription) {
      return res.status(404).json({ status: false, message: "Subscription not found!" });
    }

    res.status(200).json({
      status: true,
      message: "Subscription deleted successfully!",
      data: deletedSubscription
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
