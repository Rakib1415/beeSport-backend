const express = require("express");
const userController = require("../../controllers/web/userControllers");
const { body, validationResult } = require("express-validator");
const { userAuth } = require("../../middlewares/userAuth");
const User = require("../../models/User");
const { transformErrorsToMap } = require("../../utils");
const router = express.Router();

// User register
router.post(
  "/register",
  [
    body("phone").trim().notEmpty().withMessage("Phone is required!"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required!")
      .isLength({ min: 8 })
      .withMessage("Password length at least 8 characters!"),
    body("provider").trim().notEmpty().withMessage("Provider is required!"),
    body("country").trim().notEmpty().withMessage("Country is required!")
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      const errorMessages = transformErrorsToMap(errors.array());

      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errorMessages });
      }

      const { phone, password, provider, country } = req.body;

      const newUser = await userController.userRegister({
        phone,
        password,
        provider,
        country
      });

      return res.status(200).json(newUser);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

// User Login with Phone Number
router.post(
  "/login",
  [
    body("phone").notEmpty().withMessage("Phone number is required!"),
    body("password").notEmpty().withMessage("Password is required!")
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      const errorMessages = transformErrorsToMap(errors.array());

      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errorMessages });
      }

      const { phone, password } = req.body;
      const data = await userController.signIn({
        phone,
        password
      });
      return res.json(data);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

// Verify phone using otp
router.post(
  "/verify-phone",
  [body("phone").notEmpty().withMessage("Phone is required!"), body("otp").notEmpty().withMessage("OTP is required!")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errors.array() });
      }

      const { otp, phone } = req.body;
      const data = await userController.verifyPhoneOtp({ phone, otp });

      return res.json(data);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

// Resend otp
router.post(
  "/resend-otp",
  [
    body("phone").trim().notEmpty().withMessage("Phone is required!"),
    body("context")
      .isIn(["verify_code", "forget_code"])
      .withMessage("Context will either verify_code or forget_code!")
      .notEmpty()
      .withMessage("Context is required!")
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      const errorMessages = transformErrorsToMap(errors.array());

      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errorMessages });
      }

      const { phone, context } = req.body;

      const data = await userController.resendOTP({ phone, context });

      return res.json(data);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

// Forget Password
router.post(
  "/forget-password",
  [body("phone").trim().notEmpty().withMessage("Phone is required!")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      const errorMessages = transformErrorsToMap(errors.array());

      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errorMessages });
      }

      const { phone } = req.body;

      const data = await userController.forgetPassword({ phone });

      return res.json(data);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

// Verify Forget Password Otp
router.post(
  "/verify-forget-password-otp",
  [body("phone").notEmpty().withMessage("Phone is required!"), body("otp").notEmpty().withMessage("OTP is required!")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errors.array() });
      }

      const { otp, phone } = req.body;
      const data = await userController.verifyForgetPasswordOtp({ phone, otp });

      return res.json(data);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

// Forget Password Change
router.put(
  "/change-forget-password",
  [
    body("phone").notEmpty().withMessage("Phone is required!"),
    body("newPassword").notEmpty().withMessage("New password is required")
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errors.array() });
      }

      const { phone, newPassword } = req.body;

      const data = await userController.changeForgetPassword({
        phone,
        newPassword
      });

      return res.json(data);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

// Change Password
router.put(
  "/change-password",
  [
    body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format"),
    body("oldPassword").notEmpty().withMessage("Old password is required"),
    body("newPassword").notEmpty().withMessage("New password is required")
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errors.array() });
      }

      const { email, oldPassword, newPassword } = req.body;

      // Call the controller function to change the password
      const data = await userController.changePassword({
        email,
        oldPassword,
        newPassword
      });

      return res.json(data);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

// Getting access token by using refresh token
router.post("/refresh-token", userAuth, async (req, res, next) => {
  try {
    const data = await userController.getAccessToken(req.user);
    return res.json(data);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// User Profile
router.get("/profile", userAuth, async (req, res, next) => {
  try {
    const { phone } = req.user;
    const data = await userController.getProfile({ phone });
    return res.json(data);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// Updating User Profile
router.put(
  "/profile",
  [body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errors.array() });
      }

      const { email, name, image, role } = req.body;

      const data = await userController.updateProfile({
        email,
        name,
        image,
        role
      });

      return res.json(data);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

// Update User Favorites by Phone Number
router.put(
  "/favorites",
  userAuth,
  [
    body("phone").trim().notEmpty().withMessage("Phone is required!"),
    body("context")
      .isIn(["football_teams", "football_leagues", "football_matches", "cricket_teams", "cricket_leagues", "cricket_matches"])
      .withMessage("Context must be includes in football_teams, football_matches, football_leagues!")
      .notEmpty()
      .withMessage("Context is required!"),
    body("item").notEmpty().withMessage("Item is required!").isObject().withMessage("Item must be object!"),
    body("item.id").notEmpty().withMessage("Item Id is required!")
  ],
  async (req, res, next) => {
    try {
      const { phone, context, item } = req.body;

      // Request Validation
      const errors = validationResult(req);
      const errorMessages = transformErrorsToMap(errors.array());

      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errorMessages });
      }

      const result = await userController.addToUserFavorites({
        phone,
        context,
        item
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Update User Favorites
router.put(
  "/favorites/update",
  userAuth,
  [
    body("phone").trim().notEmpty().withMessage("Phone is required!"),
    body("context")
      .isIn(["football_teams", "football_leagues", "football_matches", "cricket_teams", "cricket_leagues", "cricket_matches"])
      .withMessage("Context must be includes in football_teams, football_matches, football_leagues!")
      .notEmpty()
      .withMessage("Context is required!"),
    body("item").notEmpty().withMessage("Item is required!"),
    body("item.id").notEmpty().withMessage("Item Id is required!")
  ],
  async (req, res, next) => {
    try {
      const { phone, context, item } = req.body;

      // Request Validation
      const errors = validationResult(req);
      const errorMessages = transformErrorsToMap(errors.array());

      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errorMessages });
      }

      const result = await userController.updateUserFavorites({
        phone,
        context,
        item
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Delete User Account
router.delete(
  "/delete",
  [body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format")],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errors.array() });
      }

      const { email } = req.body;
      const data = await userController.deleteUser({ email });

      return res.json(data);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

module.exports = router;
