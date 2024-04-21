const mongoose = require("mongoose");

const highlightSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    fixtureId: {
      type: String,
      required: true
    },
    videoType: {
      type: String,
      required: true
    },
    youtubeUrl: {
      type: String
    },
    sources: {
      type: [String]
    },
    thumbnailImageType: {
      type: String
    },
    thumbnailImage: {
      type: String
    },
    status: {
      type: String,
      default: "1"
    }
  },
  {
    timestamps: true
  }
);

const Highlight = mongoose.model("Highlight", highlightSchema);

module.exports = Highlight;
