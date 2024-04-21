const mongoose = require("mongoose");

const allowedCountrySchema = new mongoose.Schema({
  value: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  mask: {
    type: String,
    required: false
  }
});

const generalSettingSchema = new mongoose.Schema(
  {
    company_name: { type: String, default: "" },
    site_title: { type: String, default: "" },
    terms: { type: String, default: "" },
    policy: { type: String, default: "" },
    android_download_link: { type: String, default: "" },
    ios_download_link: { type: String, default: "" },
    timezone: { type: Object, default: {} },
    facebook: { type: String, default: "" },
    youtube: { type: String, default: "" },
    instagram: { type: String, default: "" },
    site_logo: { type: String, default: "" },
    site_icon: { type: String, default: "" },
    cloudinaryRootFolderName: { type: String, default: "" },
    cloudinaryRootFolderName: { type: String, default: "" },
    cloudinaryCloudName: { type: String, default: "" },
    cloudinaryApiKey: { type: String, default: "" },
    cloudinaryAppSecret: { type: String, default: "" },
    qpsms_appkey: { type: String, default: "" },
    qpsms_secretkey: { type: String, default: "" },
    allowed_country: [allowedCountrySchema]
  },
  {
    timestamps: true
  }
);

const GeneralSettings = mongoose.model("GeneralSettings", generalSettingSchema);

module.exports = GeneralSettings;
