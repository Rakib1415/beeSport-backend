const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    title: {
      type: String
    },
    duration_type: {
      type: String
    },
    duration: {
      type: Number
    },
    price: {
      type: Number
    },
    status: {
      type: String,
      default: "1"
    },
    descriptions: {
      type: [String]
    }
  },
  {
    timestamps: true
  }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;
