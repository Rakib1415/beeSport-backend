const mongoose = require("mongoose");
const popularFootballLeagueSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: {
      type: String,
      required: true
    },
    imagePath: {
      type: String,
      default: null
    },
    category: {
      type: String
    },
    country: {
      type: String,
      default: null
    },
    currentSeason: {
      type: String,
      default: null
    },
    position: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const PopularFootballLeague = mongoose.model("PopularFootballLeague", popularFootballLeagueSchema);

module.exports = PopularFootballLeague;
