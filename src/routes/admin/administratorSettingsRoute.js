const express = require("express");
const GeneralSettings = require("../../models/GeneralSetting");
const { exclude, getPublicId } = require("../../utils");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const CloudinaryStorage = require("multer-storage-cloudinary").CloudinaryStorage;

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "asia-sports/general-settings",
    allowed_formats: ["jpg", "png", "jpeg"]
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5000000 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedImageTypes = ["image/png", "image/jpg", "image/jpeg"];
    const validMimeType = allowedImageTypes.includes(file.mimetype);

    if ((file.fieldname === "site_icon" || file.fieldname === "site_logo") && validMimeType) {
      cb(null, true);
    } else {
      cb(new Error("Only .jpg, .png, or .jpeg format allowed!"));
    }
  }
});

router.get("/", async (req, res, next) => {
  try {
    const generalSettingSchema = await GeneralSettings.findOne();
    let responseData = null;

    if (generalSettingSchema) {
      responseData = exclude(generalSettingSchema.toObject(), ["_id", "__v", "createdAt", "updatedAt"]);
    }

    res.status(200).json({
      status: true,
      data: responseData
    });
  } catch (error) {
    next(error);
  }
});

router.post("/update", async (req, res, next) => {
  upload.fields([
    {
      name: "site_logo",
      maxCount: 1
    },
    {
      name: "site_icon",
      maxCount: 1
    }
  ])(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      console.error(err);
      return res.status(500).json({ error: "Multer error!" });
    } else if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error uploading file!" });
    }

    const generalSettingSchema = await GeneralSettings.findOne();

    const {
      company_name,
      site_title,
      timezone,
      facebook,
      youtube,
      instagram,
      terms,
      policy,
      android_download_link,
      ios_download_link,
      allowed_country,
      cloudinaryRootFolderName,
      cloudinaryCloudName,
      cloudinaryApiKey,
      cloudinaryAppSecret,
      qpsms_appkey,
      qpsms_secretkey
    } = req.body;

    if (generalSettingSchema) {
      const { site_logo, site_icon } = generalSettingSchema;

      const deletePreviousFile = async (file, path) => {
        if (file && path) {
          const publicId = getPublicId(path, "asia-sports");
          await cloudinary.uploader.destroy(`asia-sports/${publicId}`).catch((err) => {
            console.log(err);
          });
        }
      };

      await deletePreviousFile(req?.files?.site_logo, site_logo);
      await deletePreviousFile(req?.files?.site_icon, site_icon);

      const siteLogoPath = req?.files?.site_logo ? req?.files?.site_logo[0]?.path : site_logo || "";
      const siteIconPath = req?.files?.site_icon ? req?.files?.site_icon[0]?.path : site_icon || "";

      generalSettingSchema.company_name = company_name;
      generalSettingSchema.site_title = site_title;
      generalSettingSchema.timezone = JSON.parse(timezone);
      generalSettingSchema.terms = terms || "";
      generalSettingSchema.policy = policy || "";
      generalSettingSchema.facebook = facebook || "";
      generalSettingSchema.youtube = youtube || "";
      generalSettingSchema.instagram = instagram || "";
      generalSettingSchema.site_logo = siteLogoPath;
      generalSettingSchema.site_icon = siteIconPath;
      generalSettingSchema.android_download_link = android_download_link || "";
      generalSettingSchema.ios_download_link = ios_download_link || "";
      generalSettingSchema.cloudinaryRootFolderName = cloudinaryRootFolderName || "";
      generalSettingSchema.cloudinaryCloudName = cloudinaryCloudName || "";
      generalSettingSchema.cloudinaryApiKey = cloudinaryApiKey || "";
      generalSettingSchema.cloudinaryAppSecret = cloudinaryAppSecret || "";
      generalSettingSchema.qpsms_appkey = qpsms_appkey || "";
      generalSettingSchema.qpsms_secretkey = qpsms_secretkey || "";
      generalSettingSchema.allowed_country = JSON.parse(allowed_country) || [];

      const updatedData = await generalSettingSchema.save();

      res.status(200).json({
        status: true,
        data: updatedData
      });
    } else {
      let site_logo = "";
      let site_icon = "";

      if (req?.files?.site_logo) {
        site_logo = req?.files?.site_logo[0]?.path;
      }
      if (req?.files?.site_icon) {
        site_icon = req?.files?.site_icon[0]?.path;
      }

      const administrationSettings = new GeneralSettings({
        company_name,
        site_title,
        timezone: JSON.parse(timezone),
        facebook,
        youtube,
        instagram,
        terms,
        policy,
        android_download_link,
        ios_download_link,
        allowed_country: JSON.parse(allowed_country),
        site_logo,
        site_icon,
        cloudinaryRootFolderName,
        cloudinaryCloudName,
        cloudinaryApiKey,
        cloudinaryAppSecret
      });

      await administrationSettings.save();

      res.status(200).json({
        status: true,
        data: administrationSettings
      });
    }
  });
});

module.exports = router;
