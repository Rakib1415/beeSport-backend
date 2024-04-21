const express = require("express");
const router = express.Router();
const { generateRandomId } = require("../../utils");
const Notification = require("../../models/Notification");
const sendNotification = require("../../helpers/sendNotification");

// Get all notifications
router.get("/", async (req, res, next) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: "desc" });

    res.status(200).json({
      status: true,
      message: notifications.length === 0 ? "No Notification found!" : "Notification fetched successfully!",
      data: notifications
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

// Get single notification
router.get("/:notificationId", async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findById(notificationId);

    res.status(200).json({
      status: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
});

// Create a League
router.post("/create", async (req, res, next) => {
  try {
    const notificationData = req.body;

    const notification = new Notification({
      ...notificationData,
      id: generateRandomId(11)
    });

    await sendNotification(notificationData, "android");
    await sendNotification(notificationData, "ios");

    await notification.save();

    res.status(201).json({
      status: true,
      message: "Notification send successfully!"
    });
  } catch (error) {
    next(error);
  }
});

// Delete Notification by ID
router.delete("/delete/:notificationId", async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({
      status: true,
      message: "Notification deleted successfully!"
    });
  } catch (error) {
    next(error);
  }
});

// Delete Notification by ID
router.delete("/delete-all", async (req, res, next) => {
  try {
    await Notification.deleteMany({});

    res.status(200).json({
      status: true,
      message: "All notification deleted successfully!"
    });
  } catch (error) {
    next(error);
  }
});
