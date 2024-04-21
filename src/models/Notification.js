const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    apps: {
      type: [String],
      required: true
    },
    id: {
      type: Number,
      required: true,
      unique: true
    },
    title: {
      type: String,
      required: true
    },
    body: {
      type: String,
      required: true
    },
    image: String,
    notification_type: {
      type: String,
      default: "in_app"
    },
    action_url: String
  },
  {
    timestamps: true
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
