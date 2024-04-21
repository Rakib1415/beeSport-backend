const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    image: {
      type: String
    },
    link: {
      type: String
    },
    country: {
      type: String,
      required: true,
      unique: true
    }
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

const TipSter = model("TipSter", schema);

module.exports = TipSter;
