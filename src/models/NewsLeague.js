const mongoose = require("mongoose");
const newsLeagueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true
    },
    position: { type: Number, default: 999999999 },
    status: {
      type: String,
      default: "1"
    }
  },
  { timestamps: true }
);

const NewsLeague = mongoose.model("NewsLeague", newsLeagueSchema);

module.exports = NewsLeague;
