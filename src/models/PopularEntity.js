const mongoose = require("mongoose");

const popularEntitySchema = new mongoose.Schema(
  {
    footballLeagues: [
      {
        id: { type: Number, required: true, unique: true },
        name: {
          type: String,
          unique: true
        },
        logo: {
          type: String,
          default: null
        },
        country: {
          type: String,
          default: null
        },
        currentSeason: {
          type: String,
          default: null
        },
        showPointTable: {
          type: Number,
          default: 0
        },
        position: { type: Number, default: 0 }
      }
    ],
    footballTeams: [
      {
        id: { type: Number, required: true, unique: true },
        name: {
          type: String,
          unique: true
        },
        logo: {
          type: String,
          default: null
        },
        country: {
          type: String,
          default: null
        },
        position: { type: Number, default: 0 }
      }
    ],
    footballPlayers: [
      {
        id: { type: Number, required: true, unique: true },
        name: {
          type: String,
          unique: true
        },
        logo: {
          type: String,
          default: null
        },
        country: {
          type: String,
          default: null
        },
        position: { type: Number, default: 0 }
      }
    ],
    cricketLeagues: [
      {
        id: { type: Number, required: true, unique: true },
        name: {
          type: String,
          unique: true
        },
        logo: {
          type: String,
          default: null
        },
        country: {
          type: String,
          default: null
        },
        currentSeason: {
          type: String,
          default: null
        },
        showPointTable: {
          type: Number,
          default: 0
        },
        position: { type: Number, default: 0 }
      }
    ],
    cricketTeams: [
      {
        id: { type: Number, required: true, unique: true },
        name: {
          type: String,
          unique: true
        },
        logo: {
          type: String,
          default: null
        },
        country: {
          type: String,
          default: null
        },
        position: { type: Number, default: 0 }
      }
    ],
    cricketPlayers: [
      {
        id: { type: Number, required: true, unique: true },
        name: {
          type: String,
          unique: true
        },
        logo: {
          type: String,
          default: null
        },
        country: {
          type: String,
          default: null
        },
        position: { type: Number, default: 0 }
      }
    ]
  },
  { timestamps: true }
);

const PopularEntity = mongoose.model("PopularEntity", popularEntitySchema);

module.exports = PopularEntity;
