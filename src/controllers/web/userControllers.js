const sendOTPVerification = require("../../services/sendOTPVerification");
const User = require("../../models/User");
const {
  exclude,
  generateSignature,
  generatePassword,
  generateSalt,
  validatePassword,
  generateVerificationCode,
  checkOptValidity,
  checkTimeValidity
} = require("../../helpers");
const bcrypt = require("bcrypt");
const moment = require("moment");

const EXPIRE_TIME = 60 * 60 * 24 * 29 * 1000; // 29 Days

// Create New User
const userRegister = async (userInputs) => {
  try {
    const { phone, password, provider, country } = userInputs;

    let existingUser = await User.findOne({ phone });

    if (existingUser) {
      // Case 1: User exists, phone unverified, delete the existing user
      if (existingUser?.phone_verified === 0) {
        await User.deleteOne({ phone: phone });
        existingUser = null;
      }

      // Case 2: User exists, phone verified, and phone provider
      if (existingUser?.phone_verified === 1 && existingUser?.provider === "phone" && provider === "phone") {
        return { status: false, message: "This phone number already exists!" };
      }

      // Case 3: User exists, phone verified, different provider (prevent manual registration)
      // if (
      //   existingUser?.phone_verified === 1 &&
      //   existingUser?.provider !== "phone" &&
      //   provider === "phone"
      // ) {
      //   return {
      //     status: false,
      //     message: `Please Try, Sign Up with ${capitalizeFirstLetter(
      //       existingUser.provider
      //     )}!`,
      //   };
      // }
    }

    const salt = await generateSalt();
    const hashedPassword = await generatePassword(password, salt);

    let newUser = existingUser;

    if (!newUser) {
      // Create a new user if not exists
      newUser = new User({
        phone,
        password: hashedPassword,
        salt,
        provider,
        country
      });

      await newUser.save();
    }

    if (provider === "phone") {
      // Case 4: User is registered with email provider
      const otp = generateVerificationCode(6);
      const hashedOtp = await bcrypt.hash(otp, 10);

      // Save verify code
      await newUser.updateOne({ verify_code: hashedOtp });

      // Send OTP
      const otpResponse = await sendOTPVerification(phone, otp);

      if (otpResponse === "0") {
        return {
          status: true,
          message: "OTP sent successfully!"
        };
      } else if (otpResponse === "6") {
        return {
          status: false,
          message: "Your are provided wrong number!"
        };
      } else {
        return {
          status: false,
          message: "Something went wrong!"
        };
      }
    }

    ///////////===== Other Login Providers Not Handled Right Now  =====///////////

    // Case 5: User registered via social provider
    const accessToken = await generateSignature(
      {
        phone: newUser.phone
      },
      60 * 60 * 24 * 30 // 30 Days
    );

    const refreshToken = await generateSignature(
      {
        phone: newUser.phone
      },
      60 * 60 * 24 * 60 // 30 Days
    );

    const user = exclude(newUser.toObject(), [
      "_id",
      "__v",
      "password",
      "salt",
      "verify_code",
      "provider",
      "forget_code",
      "createdAt",
      "updatedAt",
      "favorites"
    ]);

    return {
      status: true,
      message: "Login successfully!",
      data: {
        accessToken,
        refreshToken,
        expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
        ...user,
        role: "user"
      }
    };
  } catch (error) {
    console.error("Error", error);
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      throw new Error("Email is already exist!");
    }
    throw new Error("Failed to create user!");
  }
};

// User Sign In with Phone
const signIn = async (userInfo) => {
  try {
    const { phone, password } = userInfo;
    let existingUser = await User.findOne({ phone });

    if (!existingUser) {
      return {
        status: false,
        message: "Your credentials are incorrect!"
      };
    } else {
      const validPassword = await validatePassword(password, existingUser.password, existingUser.salt);

      if (validPassword) {
        const accessToken = await generateSignature(
          {
            phone: existingUser.phone
          },
          60 * 60 * 24 * 30 // 30 Days
        );

        const refreshToken = await generateSignature(
          {
            phone: existingUser.phone
          },
          60 * 60 * 24 * 60 // 60 Days
        );

        const user = exclude(existingUser.toObject(), [
          "_id",
          "__v",
          "password",
          "salt",
          "verify_code",
          "provider",
          "forget_code",
          "createdAt",
          "updatedAt"
        ]);

        return {
          status: true,
          message: "Login successfully!",
          data: {
            accessToken,
            refreshToken,
            expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
            ...user,
            role: "user"
          }
        };
      } else {
        return {
          status: false,
          message: "Your credentials are incorrect!"
        };
      }
    }
  } catch (error) {
    console.error("Error in Sign In:", error);
    throw new Error("Failed to user Sign In!");
  }
};

// Verify Phone
const verifyPhoneOtp = async (optInfo) => {
  try {
    const { phone, otp } = optInfo;
    const findUser = await User.findOne({ phone });

    if (!findUser) {
      return { status: false, message: "OTP is expired or incorrect!" };
    }

    const hashedOtp = findUser.verify_code;
    let isValidOtp = false;
    const isValidTime = checkTimeValidity(findUser.updatedAt);

    if (!!hashedOtp) {
      isValidOtp = await checkOptValidity(otp, hashedOtp);
    }

    if (isValidOtp && isValidTime) {
      const userData = {
        phone_verified: 1,
        status: 1,
        verify_code: null
      };

      const verifiedUser = await User.findByIdAndUpdate(findUser._id, userData, { new: true });

      const accessToken = await generateSignature(
        {
          phone: verifiedUser.phone
        },
        60 * 60 * 24 * 30 // 30 Days
      );

      const refreshToken = await generateSignature(
        {
          phone: verifiedUser.phone
        },
        60 * 60 * 24 * 60 // 60 Days
      );

      const user = exclude(verifiedUser.toObject(), [
        "password",
        "salt",
        "verify_code",
        "provider",
        "forget_code",
        "createdAt",
        "updatedAt",
        "_id",
        "__v"
      ]);

      return {
        status: true,
        data: {
          ...user,
          accessToken,
          refreshToken,
          expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
          role: "user"
        },
        message: "Otp validated & sign in successfully!"
      };
    } else {
      return { status: false, message: "OTP is expired or incorrect!" };
    }
  } catch (error) {
    console.error("Error", error);
    throw new Error("Failed");
  }
};

// Get Access Token
const getAccessToken = async (userInfo) => {
  try {
    const accessToken = await generateSignature(
      {
        email: userInfo.email,
        role: userInfo.role
      },
      60 * 60 * 24 // 1 Day
    );

    const refreshToken = await generateSignature(
      {
        email: userInfo.email,
        role: userInfo.role
      },
      60 * 60 * 24 * 7 // 7 Days
    );

    return {
      status: true,
      message: "Access Token refresh successfully!",
      data: {
        accessToken,
        refreshToken,
        expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME)
      }
    };
  } catch (error) {
    console.error("Error in Sign In:", error);
    throw new Error("Failed to Sign In user");
  }
};

// Resend OTP (Handle With Context - 1. Verify Code 2. Forget Code)
const resendOTP = async (userInfo) => {
  try {
    const { phone, context } = userInfo;

    const existingUser = await User.findOne({ phone });

    if (!existingUser) {
      return { status: false, message: "User not found!" };
    }

    if (existingUser.phone_verified !== 0 && context === "verify_code") {
      return { status: false, message: "Phone is already verified!" };
    }

    const otp = generateVerificationCode(6);
    const hashedOtp = await bcrypt.hash(otp, 10);

    // 2 minutes block time for each request
    if (!existingUser.resend_otp_block_timestamp) {
      const time = moment().add(2, "minutes").unix();

      if (context === "verify_code") {
        await existingUser.updateOne({
          verify_code: hashedOtp,
          resend_otp_block_timestamp: time
        });
      } else {
        await existingUser.updateOne({
          forget_code: hashedOtp,
          resend_otp_block_timestamp: time
        });
      }
    } else {
      const currentTime = moment().unix();
      const isBlocked = moment(currentTime).isBefore(existingUser.resend_otp_block_timestamp);

      if (isBlocked) {
        return {
          status: false,
          message: "Try again after waiting for up to 2 minutes!"
        };
      } else {
        const time = moment().add(2, "minutes").unix();

        if (context === "verify_code") {
          await existingUser.updateOne({
            verify_code: hashedOtp,
            resend_otp_block_timestamp: time
          });
        } else {
          await existingUser.updateOne({
            forget_code: hashedOtp,
            resend_otp_block_timestamp: time
          });
        }
      }
    }

    // Send OTP
    const otpResponse = await sendOTPVerification(phone, otp);

    if (otpResponse === "0") {
      return {
        status: true,
        message: "New OTP sent successfully!"
      };
    } else if (otpResponse === "6") {
      return {
        status: false,
        message: "Your are provided wrong number!"
      };
    } else {
      return {
        status: false,
        message: "Something went wrong!"
      };
    }
  } catch (error) {
    console.error("Error in Resend Verification Email:", error);
    throw new Error("Failed to resend verification email");
  }
};

// Forget Password
const forgetPassword = async (userInfo) => {
  try {
    const { phone } = userInfo;
    const existingUser = await User.findOne({ phone, phone_verified: 1 });

    if (!existingUser) {
      return {
        status: false,
        message: "Please, provide us your verified number!"
      };
    }

    const otp = generateVerificationCode(6);
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Save Forget Code
    await existingUser.updateOne({ forget_code: hashedOtp });

    // Send OTP
    const otpResponse = await sendOTPVerification(phone, otp);

    if (otpResponse === "0") {
      return {
        status: true,
        message: "OTP sent successfully!"
      };
    } else if (otpResponse === "6") {
      return {
        status: false,
        message: "Your are provided wrong number!"
      };
    } else {
      return {
        status: false,
        message: "Something went wrong!"
      };
    }
  } catch (error) {
    console.error("Error in forget Password:", error);
    throw new Error("Failed to forget password!");
  }
};

// Verify Forget Password OTP
const verifyForgetPasswordOtp = async (optInfo) => {
  try {
    const { phone, otp } = optInfo;
    const findUser = await User.findOne({ phone });

    if (!findUser) {
      return { status: false, message: "OTP is expired or incorrect!" };
    }

    const hashedOtp = findUser.forget_code;
    let isValidOtp = false;
    const isValidTime = checkTimeValidity(findUser.updatedAt);

    if (!!hashedOtp) {
      isValidOtp = await checkOptValidity(otp, hashedOtp);
    }

    if (isValidOtp && isValidTime) {
      await findUser.updateOne({ forget_code: null });
      return {
        status: true,
        message: "Otp validated successfully!"
      };
    } else {
      return { status: false, message: "OTP is expired or incorrect!" };
    }
  } catch (error) {
    console.error("Error", error);
    throw new Error("Failed");
  }
};

// Change Password
const changeForgetPassword = async ({ phone, newPassword }) => {
  try {
    const existingUser = await User.findOne({ phone });

    if (!existingUser) {
      return { status: false, message: "User not found!" };
    }

    const newSalt = await generateSalt();
    const hashedNewPassword = await generatePassword(newPassword, newSalt);

    existingUser.password = hashedNewPassword;
    existingUser.salt = newSalt;

    await existingUser.save();

    return { status: true, message: "Password changed successfully!" };
  } catch (error) {
    console.error("Error in Change Password:", error);
    throw new Error("Failed to change password");
  }
};

// Change Password
const changePassword = async ({ email, oldPassword, newPassword }) => {
  try {
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return { status: false, message: "User not found" };
    }

    const isPasswordValid = await validatePassword(oldPassword, existingUser.password, existingUser.salt);

    if (!isPasswordValid) {
      return { status: false, message: "Invalid old password" };
    }

    if (oldPassword === newPassword) {
      return {
        status: false,
        message: "New password cannot be the same as the old password"
      };
    }

    const newSalt = await generateSalt();
    const hashedNewPassword = await generatePassword(newPassword, newSalt);

    existingUser.password = hashedNewPassword;
    existingUser.salt = newSalt;

    await existingUser.save();

    return { status: true, message: "Password changed successfully" };
  } catch (error) {
    console.error("Error in Change Password:", error);
    throw new Error("Failed to change password");
  }
};

// Get User Profile
const getProfile = async (userInfo) => {
  try {
    const { phone } = userInfo;

    const existingUser = await User.findOne({ phone });

    if (!existingUser) {
      throw new Error("No profile exists!");
    }

    const userWithoutSensitiveInfo = exclude(existingUser.toObject(), [
      "_id",
      "__v",
      "password",
      "salt",
      "verify_code",
      "forget_code",
      "createdAt",
      "updatedAt"
    ]);

    userWithoutSensitiveInfo.role = "user";

    return {
      status: true,
      message: "User profile found!",
      data: userWithoutSensitiveInfo
    };
  } catch (error) {
    console.log(error);
    if (error.message === "No Profile") {
      throw new Error("User profile does not exist");
    } else {
      throw new Error("Failed to retrieve user profile");
    }
  }
};

// User Favorites
const addToUserFavorites = async (favoriteInfo) => {
  try {
    const { phone, context, item } = favoriteInfo;

    console.log("context", context);
    console.log("item", item);

    const updatedUser = await User.findOneAndUpdate(
      { phone: phone },
      {
        $addToSet: { [`favorites.${context}`]: item }
      },
      {
        new: true
      }
    );

    if (!updatedUser) {
      return {
        status: false,
        message: "Please, provide valid credentials!"
      };
    }

    const userWithoutSensitiveInfo = exclude(updatedUser?.toObject(), [
      "_id",
      "__v",
      "password",
      "salt",
      "verify_code",
      "forget_code",
      "createdAt",
      "updatedAt",
      "resend_otp_block_timestamp"
    ]);

    return {
      status: true,
      message: "Add to Favorites Successfully!",
      data: userWithoutSensitiveInfo
    };
  } catch (error) {
    console.log(error);
    throw new Error("Failed to add user favorites!");
  }
};

// Update User Favorites
const updateUserFavorites = async (favoriteInfo) => {
  try {
    const { phone, context, item } = favoriteInfo;

    console.log("context", context);
    console.log("item", item);

    const updatedUser = await User.findOneAndUpdate(
      { phone: phone },
      {
        $pull: { [`favorites.${context}`]: { id: item.id } }
      },
      {
        new: true
      }
    );

    if (!updatedUser) {
      return {
        status: false,
        message: "Please, provide valid credentials!"
      };
    }

    const userWithoutSensitiveInfo = exclude(updatedUser?.toObject(), [
      "_id",
      "__v",
      "password",
      "salt",
      "verify_code",
      "forget_code",
      "createdAt",
      "updatedAt",
      "resend_otp_block_timestamp"
    ]);

    return {
      status: true,
      message: "Favorites Updated Successfully!",
      data: userWithoutSensitiveInfo
    };
  } catch (error) {
    console.log(error);
    throw new Error("Failed to update user favorites!");
  }
};

// Update User Profile
const updateProfile = async (updatedUserInfo) => {
  try {
    const { email, name, image, role } = updatedUserInfo;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return { status: false, message: "User not found" };
    }

    if (name) {
      existingUser.name = name;
    }

    if (image) {
      existingUser.image = image;
    }

    if (role) {
      existingUser.role = role;
    }

    await existingUser.save();

    const userWithoutSensitiveInfo = {
      ...existingUser.toObject(),
      password: undefined,
      salt: undefined,
      verify_code: undefined,
      provider: undefined,
      forget_code: undefined,
      createdAt: undefined,
      updatedAt: undefined
    };

    return {
      status: true,
      message: "User profile updated",
      user: userWithoutSensitiveInfo
    };
  } catch (error) {
    console.error("Error in Update Profile:", error);
    throw new Error("Failed to update user profile");
  }
};

// Delete User Account
const deleteUser = async (userInfo) => {
  try {
    const { email } = userInfo;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return { status: false, message: "User not found" };
    }

    await User.deleteOne({ email });

    return { status: true, message: "User deleted successfully" };
  } catch (error) {
    console.error("Error in Delete User:", error);
    throw new Error("Failed to delete user");
  }
};

module.exports = {
  signIn,
  resendOTP,
  deleteUser,
  getProfile,
  userRegister,
  updateProfile,
  getAccessToken,
  forgetPassword,
  changePassword,
  verifyPhoneOtp,
  addToUserFavorites,
  updateUserFavorites,
  changeForgetPassword,
  verifyForgetPasswordOtp
};
