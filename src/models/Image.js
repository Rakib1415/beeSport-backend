const mongoose = require("mongoose");
const imageSchema = new mongoose.Schema(
  {
    title: String,
    description: String,

    filename: String,

    path: String,

    originalname: String,

    mimetype: String,

    size: Number
  },
  { timestamps: true }
);

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;
