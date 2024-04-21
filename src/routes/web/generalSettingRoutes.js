const express = require("express");
const { getGenaralSetting } = require("../../controllers/web/genaralSettingController");
const router = express.Router();

router.get("/", getGenaralSetting);

module.exports = router;
