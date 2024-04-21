const cloudinary = require("cloudinary").v2;
const GeneralSettings = require("../src/models/GeneralSetting");

const fetchCloudinarySettings = async () => {
  try {
    const settings = await GeneralSettings.findOne(); // Assuming you have only one settings document

    const { cloudinary_cloud_name, cloudinary_api_key, cloudinary_app_secret } = settings.toObject();

    return {
      cloud_name: cloudinary_cloud_name,
      api_key: cloudinary_api_key,
      api_secret: cloudinary_app_secret,
      upload: {
        maxFileSize: 50000000 // 50MB limit
      }
    };
  } catch (error) {
    console.error("Something went wrong in cloudinary settings:", error);
    return null;
  }
};

async function configureCloudinary() {
  const cloudinarySettings = await fetchCloudinarySettings();

  if (cloudinarySettings) {
    console.log("Connect to Cloudinary Bucket!");
    return cloudinary.config(cloudinarySettings);
  } else {
    console.log("Cloudinary configuration failed. Check your settings!");
  }
}

module.exports = configureCloudinary;
