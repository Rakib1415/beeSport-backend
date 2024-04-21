const { body, param } = require("express-validator");
const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");
const User = require("../../models/User"); // Import the User model
const { transformErrorsToMap, getSlugify, generateRandomId, generateSalt, generatePassword } = require("../../utils");

// validation
const validateCreateUser = [
  body("name").notEmpty().withMessage("Name is required!"),
  body("status").notEmpty().withMessage("Status is required!"),
  body("email").notEmpty().withMessage("Email is required!").isEmail().withMessage("Invalid email format!"),
  body("password").notEmpty().withMessage("Password is required!")
];

const validateSingleUser = [param("userId").notEmpty().withMessage("User ID is required!")];

// Get All Users
router.get("/", async (req, res, next) => {
  try {
    const users = await User.find();

    res.status(200).json({
      status: true,
      message: users.length === 0 ? "No users found!" : "Users fetched successfully!",
      data: users
    });
  } catch (error) {
    next(error);
  }
});

// Create A User
router.post("/create", validateCreateUser, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    const errorMessages = transformErrorsToMap(errors.array());

    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false, errors: errorMessages });
    }

    const { name, email, password, status, image } = req.body;

    const isExist = await User.findOne({
      email: email
    });

    if (isExist) {
      res.status(200).json({
        status: false,
        message: "User already Exist!"
      });
    }

    const salt = await generateSalt();
    const hashedPassword = await generatePassword(password, salt);

    const user = new User({
      name,
      email,
      image,
      password: hashedPassword,
      salt,
      status,
      email_verified: 1,
      provider: "email"
    });

    const savedUser = await user.save();

    res.status(201).json({
      status: true,
      message: "User created successfully!",
      data: savedUser
    });
  } catch (error) {
    next(error);
  }
});

// Find User by ID
router.get("/:userId", validateSingleUser, async (req, res, next) => {
  try {
    const id = req.params.userId;
    const user = await User.findOne({ _id: id });

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found!" });
    }

    res.status(200).json({
      status: true,
      message: "User fetched successfully!",
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// Update User by Id
router.put("/:userId", validateSingleUser, async (req, res, next) => {
  try {
    const id = req.params.userId;
    const errors = validationResult(req);
    const errorMessages = transformErrorsToMap(errors.array());

    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false, errors: errorMessages });
    }

    const { name, email, image, status } = req.body;

    const isExist = await User.findOne({
      email: email,
      _id: { $ne: id }
    });

    if (isExist) {
      res.status(200).json({
        status: false,
        message: "User already Exist!"
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        name,
        email,
        image,
        status
      },
      {
        new: true
      }
    );

    res.status(201).json({
      status: true,
      message: "User updated successfully!",
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
});

// Delete a User by Id
router.delete("/:userId", validateSingleUser, async (req, res, next) => {
  try {
    const id = req.params.userId;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ status: false, message: "User not found!" });
    }

    res.status(200).json({
      status: true,
      message: "User deleted successfully!",
      data: deletedUser
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
