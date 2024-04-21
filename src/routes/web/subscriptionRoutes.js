const express = require("express");
const { getAllSubscription } = require("../../controllers/web/subscriptionController");
const router = express.Router();

router.get("/", async (req, res) => {
  const allSubscriptions = await getAllSubscription();
  res.status(200).json(allSubscriptions);
});

module.exports = router;
