const mongoose = require("mongoose");
const leagueSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: {
      type: String,
      unique: true
    },
    image: {
      type: String
    },
    status: {
      type: String,
      default: "1"
    },
    position: { type: Number, default: 999999999 }
  },
  { timestamps: true }
);

const Leagues = mongoose.model("Leagues", leagueSchema);

module.exports = Leagues;
