const mongoose = require("mongoose");

const adsTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    id: { type: Number, required: true, unique: true },
    status: {
      type: String,
      default: "1"
    },
    position: { type: Number, default: 999999999 }
  },
  {
    timestamps: true
  }
);

const AdsType = mongoose.model("AdsType", adsTypeSchema);

module.exports = AdsType;
