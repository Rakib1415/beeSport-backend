const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: null
    },
    phone: {
      type: String,
      unique: true,
      required: true
    },
    email: {
      type: String,
      default: null
    },
    country: {
      type: String,
      default: null
    },
    password: {
      type: String,
      default: null
    },
    image: {
      type: String,
      default: null
    },
    status: {
      type: Number,
      default: 0
    },
    verify_code: {
      type: String,
      default: null
    },
    phone_verified: {
      type: Number,
      default: 0
    },
    provider: {
      type: String,
      default: null
    },
    forget_code: {
      type: String,
      default: null
    },
    resend_otp_block_timestamp: {
      type: Number,
      default: null
    },
    salt: {
      type: String,
      default: null
    },
    favorites: {
      football_teams: [
        {
          type: mongoose.Schema.Types.Mixed
        }
      ],
      football_leagues: [
        {
          type: mongoose.Schema.Types.Mixed
        }
      ],
      football_matches: [
        {
          type: mongoose.Schema.Types.Mixed
        }
      ],
      cricket_teams: [
        {
          type: mongoose.Schema.Types.Mixed
        }
      ],
      cricket_leagues: [
        {
          type: mongoose.Schema.Types.Mixed
        }
      ],
      cricket_matches: [
        {
          type: mongoose.Schema.Types.Mixed
        }
      ],
    }
  },
  {
    timestamps: true,
    strict: true // Enforce strict validation
  }
);

// userSchema.methods.toJSON = function () {
//   const obj = this.toObject();
//   delete obj.__v;
//   delete obj.createdAt;
//   delete obj.updatedAt;
//   delete obj.password;
//   delete obj.refreshToken;
//   delete obj.salt;
//   delete obj.forgetCode;
//   delete obj.otpExpires;
//   delete obj.verifyCode;
//   return JSON.parse(JSON.stringify(obj).replace(/_id/g, "id"));
// };

const User = mongoose.model("User", userSchema);

module.exports = User;
