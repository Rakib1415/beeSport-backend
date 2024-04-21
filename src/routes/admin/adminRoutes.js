const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const adminController = require("../../controllers/admin/adminController");
const { userAuth } = require("../../middlewares/userAuth");

const validate = (validations) => {
  return async (req, res, next) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) {
        return res.status(422).json({ status: false, errors: result.array() });
      }
    }
    next();
  };
};

// Route for admin register
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required!"),
    body("email").isEmail().withMessage("Invalid email format!"),
    body("password").notEmpty().withMessage("Password is required!")
  ],
  validate([
    body("name").notEmpty().withMessage("Name is required!"),
    body("email").isEmail().withMessage("Invalid email format!"),
    body("password").notEmpty().withMessage("Password is required!")
  ]),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ status: false, errors: errors.array() });
      }

      const { name, email, password } = req.body;
      const adminData = {
        name,
        email,
        password
      };

      const newAdmin = await adminController.createAdmin(adminData);

      return res.status(201).json(newAdmin);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

// Route for admin login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").notEmpty().withMessage("Password is required")
  ],
  validate([
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").notEmpty().withMessage("Password is required")
  ]),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ status: false, errors: errors.array() });
      }

      const { email, password } = req.body;

      const data = await adminController.signIn({ email, password });

      return res.json(data);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

// Route for getting access token by using refresh token
router.get("/refresh-token", userAuth, async (req, res, next) => {
  try {
    const data = await adminController.getAccessToken(req.user);
    return res.json(data);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// Route for changing admin password
router.put(
  "/change-password",
  [
    body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format"),
    body("oldPassword").notEmpty().withMessage("Old password is required"),
    body("newPassword").notEmpty().withMessage("New password is required")
  ],
  validate([
    body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format"),
    body("oldPassword").notEmpty().withMessage("Old password is required"),
    body("newPassword").notEmpty().withMessage("New password is required")
  ]),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ status: false, errors: errors.array() });
      }

      const { email, oldPassword, newPassword } = req.body;

      // Call the controller function to change the password
      const data = await adminController.changePassword({
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

// Route for admin profile
router.post(
  "/profile",
  [body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format")],
  validate([body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format")]),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ status: false, errors: errors.array() });
      }

      const { email } = req.body;

      const data = await adminController.getProfile({ email });

      return res.json(data);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

// Route for updating admin profile
router.put(
  "/profile",
  [
    body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format"),
    body("name").optional().notEmpty().withMessage("Name is required"),
    body("image").optional().notEmpty().withMessage("Image is required"),
    body("role").optional().notEmpty().withMessage("Role is required")
  ],
  validate([
    body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format"),
    body("name").optional().notEmpty().withMessage("Name is required"),
    body("image").optional().notEmpty().withMessage("Image is required"),
    body("role").optional().notEmpty().withMessage("Role is required")
  ]),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ status: false, errors: errors.array() });
      }

      const { email, name, image, role } = req.body;

      const data = await adminController.updateProfile({
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

router.delete(
  "/delete",
  [body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format")],
  validate([body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format")]),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ status: false, errors: errors.array() });
      }

      const { email } = req.body;
      const data = await adminController.deleteAdmin({ email });

      return res.json(data);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

module.exports = router;
