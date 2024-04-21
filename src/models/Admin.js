const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      unique: true
    },
    password: String,
    image: {
      type: String,
      default: null
    },
    role: {
      type: String,
      default: "admin"
    },
    status: {
      type: Number,
      default: 0
    },
    verify_code: {
      type: String,
      default: null
    },
    email_verified: {
      type: Number,
      default: 0
    },
    provider: String,
    forget_code: {
      type: String,
      default: null
    },
    token: String,
    salt: String
  },
  {
    timestamps: true
  }
);

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
