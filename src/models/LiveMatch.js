const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  fixture_id: {
    type: String
  },
  sports_type_name: {
    type: String,
    required: true
  },
  match_title: {
    type: String,
    required: true
  },
  match_time: { type: String, required: true }, // Change data type to UNIX timestamp
  time: {
    type: String,
    required: true
  },
  is_hot: { type: Number, default: 0 },
  status: { type: String, default: "1" },
  team_one_name: {
    type: String,
    required: true
  },
  team_two_name: {
    type: String,
    required: true
  },
  team_one_image_type: String,
  team_two_image_type: String,
  team_one_image: String,
  team_two_image: String,
  position: { type: Number, default: 999999999 },
  streaming_sources: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stream"
    }
  ]
});

const LiveMatch = mongoose.model("LiveMatch", matchSchema);

module.exports = LiveMatch;
