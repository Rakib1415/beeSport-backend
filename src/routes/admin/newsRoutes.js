const { body, param } = require("express-validator");
const express = require("express");
const multer = require("multer");
const {
  createNews,
  getAllNews,
  getNewsById,
  updateNews,
  deleteNews
} = require("../../controllers/admin/newsController");

const upload = multer();
const router = express.Router();

// validation
const validateNews = [
  body("title").notEmpty().withMessage("Title is required!"),
  body("imageType")
    .isIn(["url", "image"])
    .withMessage("Image Type either image or url!")
    .notEmpty()
    .withMessage("Image Type is required!"),
  body("imageUrl").if(body("imageType").equals("url")).notEmpty().withMessage("Image Url is required!"),
  body("category")
    .isIn(["cricket", "football"])
    .withMessage("Category either cricket or football!")
    .notEmpty()
    .withMessage("Category is required!"),
  body("league").notEmpty().withMessage("League is required!"),
  body("description").notEmpty().withMessage("Description is required!"),
  body("publishDate").notEmpty().withMessage("Publish date is required!"),
  body("status").notEmpty().withMessage("Status is required!")
];
const validateSingleNews = [param("newsId").notEmpty().withMessage("AdsType ID is required!")];

// Routes
router.get("/", getAllNews);
router.get("/:newsId", validateSingleNews, getNewsById);
router.post("/", upload.single("image"), validateNews, createNews);
router.put("/:newsId", upload.single("image"), validateNews, updateNews);
router.delete("/:newsId", validateSingleNews, deleteNews);

module.exports = router;
