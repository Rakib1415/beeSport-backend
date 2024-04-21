const AppModel = require("../../models/AppModel");

// Get All Apps
const getApp = async () => {
  try {
    const apps = await AppModel.find();
    return { status: true, data: apps };
  } catch (error) {
    console.error("Error getting apps:", error);
    throw error;
  }
};

// Craete App
const createApp = async (appInfo) => {
  try {
    const existingApp = await AppModel.findOne({
      $or: [{ app_unique_id: appInfo.app_unique_id }, { app_name: appInfo.app_name }]
    });

    if (existingApp) {
      if (existingApp.app_unique_id === appInfo.app_unique_id) {
        return { status: false, message: "App unique id must be unique!" };
      }
      if (existingApp.app_name === appInfo.app_name) {
        return { status: false, message: "App name must be unique!" };
      }
    } else {
      const newApp = new AppModel(appInfo);
      const savedApp = await newApp.save();
      return { status: true, data: savedApp };
    }
  } catch (error) {
    console.error("Error creating app:", error.message);
    throw error;
  }
};

// Get Single App
const getSingleApp = async (appUniqueId) => {
  try {
    const existingApp = await AppModel.findOne({ app_unique_id: appUniqueId });

    if (!existingApp) {
      return { status: false, message: "App does not exists!" };
    }

    return { status: true, data: existingApp };
  } catch (error) {
    console.error("Error getting single app:", error);
    throw error;
  }
};

// Update App
const updateSingleApp = async ({ appId, appData }) => {
  try {
    const existingApp = await AppModel.findOne({ app_unique_id: appId });

    if (!existingApp) {
      return { status: false, message: "App does not exists!" };
    }

    // Check if another App with the same name & unique id already exists
    const isExists = await AppModel.findOne({
      $or: [{ app_unique_id: appData.app_unique_id }, { app_name: appData.app_name }],
      _id: { $ne: existingApp._id }
    });

    if (isExists) {
      return { status: false, message: "App Name & Unique Id must be unique!" };
    }

    for (const key in appData) {
      if (appData.hasOwnProperty(key)) {
        existingApp[key] = appData[key];
      }
    }

    await existingApp.save();

    return { status: true, data: existingApp };
  } catch (error) {
    console.error("Error getting single app:", error);
    throw error;
  }
};

const deleteSingleApp = async (appUniqueId) => {
  try {
    const existingApp = await AppModel.findOne({ app_unique_id: appUniqueId });

    if (!existingApp) {
      return { status: false, message: "App does not exists!" };
    }

    const deletedApp = await AppModel.findOneAndDelete({
      app_unique_id: appUniqueId
    });

    return { status: true, data: deletedApp };
  } catch (error) {
    console.error("Error getting single app:", error);
    throw error;
  }
};

module.exports = {
  createApp,
  getApp,
  getSingleApp,
  updateSingleApp,
  deleteSingleApp
};
