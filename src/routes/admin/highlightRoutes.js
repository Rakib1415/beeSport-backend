const express = require("express");
const { body, param } = require("express-validator");
const multer = require("multer");
const {
  getHighlights,
  createHighlight,
  getHighlightById,
  updateHighlight,
  deleteHighlight
} = require("../../controllers/admin/highlightController");

const upload = multer();
const router = express.Router();

// validation
const validateHighlightBody = [
  body("title").notEmpty().withMessage("Title is required!"),
  body("date").notEmpty().withMessage("Date is required!"),
  body("category")
    .isIn(["cricket", "football"])
    .withMessage("Category either cricket or football!")
    .notEmpty()
    .withMessage("Category is required!"),
  body("videoType")
    .isIn(["source", "youtube"])
    .withMessage("Video type either youtube or source!")
    .notEmpty()
    .withMessage("Video type is required!"),
  body("youtubeUrl").if(body("videoType").equals("youtube")).notEmpty().withMessage("Youtube url is required!"),
  body("sources").if(body("videoType").equals("source")).notEmpty().withMessage("Sources is required!"),
  body("thumbnailImageType")
    .isIn(["url", "image"])
    .withMessage("Thumbnail Image Type either image or url!")
    .notEmpty()
    .withMessage("Thumbnail image type is required!"),
  body("thumbnailImageUrl")
    .if(body("thumbnailImageType").equals("url"))
    .notEmpty()
    .withMessage("Thumbnail Image Url is required!")
];
const validateParams = [param("highlightId").notEmpty().withMessage("Highlight ID is required!")];

router.get("/", getHighlights);
router.get("/:highlightId", validateParams, getHighlightById);
router.post("/create", upload.single("thumbnailImage"), validateHighlightBody, createHighlight);
router.put("/:highlightId", validateParams, upload.single("thumbnailImage"), validateHighlightBody, updateHighlight);
router.delete("/:highlightId", validateParams, deleteHighlight);

module.exports = router;
