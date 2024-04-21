const Admin = require("../../models/Admin");
const {
  exclude,
  generateSignature,
  generatePassword,
  generateSalt,
  validatePassword,
  generateVerificationToken
} = require("../../utils");

const EXPIRE_TIME = 60 * 60 * 20 * 1000; // 20 Hours

// Create New Admin
const createAdmin = async (adminInputs) => {
  try {
    const { email, password, name } = adminInputs;

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return { status: false, message: "This email already exist!" };
    }

    const salt = await generateSalt();
    const hashedPassword = await generatePassword(password, salt);

    const newAdmin = new Admin({
      name: name,
      email: email,
      password: hashedPassword,
      salt: salt
    });

    await newAdmin.save();

    // Generate access token
    const accessToken = await generateVerificationToken({
      email: newAdmin.email,
      name: newAdmin.name,
      role: newAdmin.role
    });

    return {
      status: true,
      message: "Admin created successfully!",
      data: {
        accessToken
      }
    };
  } catch (error) {
    console.error("Error", error);
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      throw new Error("Email is already exist!");
    }
    throw new Error("Failed to create admin");
  }
};

// Admin signIn
const signIn = async (adminInfo) => {
  try {
    const { email, password } = adminInfo;
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      const validPassword = await validatePassword(password, existingAdmin.password, existingAdmin.salt);

      if (validPassword) {
        const accessToken = await generateSignature(
          {
            email: existingAdmin.email,
            role: existingAdmin.role
          },
          60 * 60 * 24 // 1 Day
        );

        const refreshToken = await generateSignature(
          {
            email: existingAdmin.email,
            role: existingAdmin.role
          },
          60 * 60 * 24 * 7 // 7 Days
        );

        const admin = exclude(existingAdmin.toObject(), [
          "_id",
          "__v",
          "verify_code",
          "password",
          "salt",
          "forget_code",
          "createdAt",
          "updatedAt"
        ]);

        return {
          status: true,
          message: "Admin Login Successfully!",
          data: {
            accessToken,
            refreshToken,
            expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
            ...admin,
            role: "admin"
          }
        };
      } else {
        return {
          status: false,
          message: "Your credentials are incorrect!"
        };
      }
    } else {
      return {
        status: false,
        message: "Your credentials are incorrect!"
      };
    }
  } catch (error) {
    console.error("Error in Sign In:", error);
    throw new Error("Failed to Sign In admin");
  }
};

// Get Access Token
const getAccessToken = async (adminInfo) => {
  try {
    const accessToken = await generateSignature(
      {
        email: adminInfo.email,
        role: adminInfo.role
      },
      60 * 60 * 24 // 1 Day
    );

    const refreshToken = await generateSignature(
      {
        email: adminInfo.email,
        role: adminInfo.role
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

const changePassword = async ({ email, oldPassword, newPassword }) => {
  try {
    const existingAdmin = await Admin.findOne({ email });

    if (!existingAdmin) {
      return { status: false, message: "Admin not found" };
    }

    const isPasswordValid = await validatePassword(oldPassword, existingAdmin.password, existingAdmin.salt);

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

    existingAdmin.password = hashedNewPassword;
    existingAdmin.salt = newSalt;

    await existingAdmin.save();

    return { status: true, message: "Password changed successfully" };
  } catch (error) {
    console.error("Error in Change Password:", error);
    throw new Error("Failed to change password");
  }
};

// Get Admin Profile
const getProfile = async (adminInfo) => {
  try {
    const { email } = adminInfo;

    const existingAdmin = await Admin.findOne({ email });

    if (!existingAdmin) {
      throw new Error("No Profile");
    }

    const adminWithoutSensitiveInfo = exclude(existingAdmin.toObject(), [
      "password",
      "salt",
      "forget_code",
      "createdAt",
      "updatedAt"
    ]);

    return {
      status: true,
      message: "Admin profile found",
      data: adminWithoutSensitiveInfo
    };
  } catch (error) {
    if (error.message === "No Profile") {
      throw new Error("Admin profile does not exist");
    } else {
      throw new Error("Failed to retrieve admin profile");
    }
  }
};

// Update Admin Profile
const updateProfile = async (updatedAdminInfo) => {
  try {
    const { email, name, image, role } = updatedAdminInfo;

    const existingAdmin = await Admin.findOne({ email });

    if (!existingAdmin) {
      return { status: false, message: "Admin not found" };
    }

    if (name) {
      existingAdmin.name = name;
    }

    if (image) {
      existingAdmin.image = image;
    }

    if (role) {
      existingAdmin.role = role;
    }

    await existingAdmin.save();

    const adminWithoutSensitiveInfo = {
      ...existingAdmin.toObject(),
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
      message: "Admin profile updated",
      data: adminWithoutSensitiveInfo
    };
  } catch (error) {
    console.error("Error in Update Profile:", error);
    throw new Error("Failed to update admin profile");
  }
};

const deleteAdmin = async (adminInfo) => {
  try {
    const { email } = adminInfo;

    const existingAdmin = await Admin.findOne({ email });

    if (!existingAdmin) {
      return { status: false, message: "Admin not found" };
    }

    await Admin.deleteOne({ email });

    return { status: true, message: "Admin deleted successfully" };
  } catch (error) {
    console.error("Error in Delete Admin:", error);
    throw new Error("Failed to delete admin");
  }
};

module.exports = {
  createAdmin,
  signIn,
  getAccessToken,
  getProfile,
  updateProfile,
  deleteAdmin,
  changePassword
};
