const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    country: { type: String, required: true },
    banner: {
      small: { image: { type: String }, action: { type: String } },
      large: { image: { type: String }, action: { type: String } }
    },
    interstitial: { image: { type: String }, action: { type: String } }
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

const Banner = model("Banner", schema);

module.exports = Banner;
