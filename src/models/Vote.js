const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    fixtureId: {
      type: String,
      required: true
    },
    home: {
      type: Number,
      default: 0
    },
    away: {
      type: Number,
      default: 0
    },
    draw: {
      type: Number,
      default: 0
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  {
    timestamps: true
  }
);

schema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  delete obj.createdAt;
  delete obj.updatedAt;
  return JSON.parse(JSON.stringify(obj));
};

const Vote = model("Vote", schema);

module.exports = Vote;
