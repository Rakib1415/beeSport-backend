const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    league: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      required: true
    },
    imageType: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    shortDescription: {
      type: String,
      default: null
    },
    description: {
      type: String,
      required: true
    },
    publishDate: {
      type: Date,
      required: true
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

const News = mongoose.model("News", newsSchema);

module.exports = News;
