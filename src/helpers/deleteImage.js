const Image = require("../models/Image");

const fs = require("fs").promises;

async function deleteImageByName(filename) {
  try {
    const image = await Image.findOne({ filename });

    if (!image) {
      throw new Error("Image not found");
    }
    // Delete from database
    await Image.deleteOne({ _id: image._id });
    // Delete from server
    await fs.unlink(image.path);

    return { success: true, message: "Image deleted successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

module.exports = deleteImageByName;
