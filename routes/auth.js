const { check, validationResult } = require("express-validator");
const express = require("express");
const router = express.Router();
/* Importing the Schema Model */
const User = require("../models/User");
/* importing bcrypt.js for password hashing */
var bcrypt = require("bcryptjs");
/* importing JWT token for adding another layer of authentication - so that server provides correct persons data to the user */
var jwt = require("jsonwebtoken");

/* importing fetchuser as our middleware for the login user information */
var fetchUser = require('../middleware/fetchUser');

// Make sure dotenv is configured at the top of your entry file (index.js)
require('dotenv').config(); // Load environment variables

// ROUTE 1: Create a User using: POST "/api/auth/createuser". No login required
router.post(
  "/createuser",
  [
    check("name", "Enter a valid name").isLength({ min: 3 }),
    check("email", "Enter a valid email").isEmail(),
    check("password", "Password must be at least 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    let success = false;
    /* THROWING ERRORS */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    try {
      /* CHECKING IF USER ALREADY EXISTS - THROW ERROR */
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ success, error: "Sorry, a user with this email already exists" });
      }

      /* ADDING SALT TO HASH PASSWORD */
      const salt = await bcrypt.genSalt(10);
      const securedPass = await bcrypt.hash(req.body.password, salt);

      /* CREATE A USER IF THEY DON'T EXIST */
      user = new User({
        name: req.body.name,
        email: req.body.email,
        password: securedPass,
      });

      /* SAVING TO DATABASE */
      await user.save();

      /* ADDING A JWT TOKEN TO VERIFY AUTHENTICATION */
      const data = {
        user: {
          id: user.id,
        },
      };
      const token = jwt.sign(data, process.env.JWT_SECRET); // Use the secret from .env
      success = true;
      res.json({ success, token });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error Occurred");
    }
  }
);

// ROUTE 2: Logging a User in using: POST "/api/auth/login". No login required
router.post(
  "/login",
  [
    check("email", "Enter a valid email").isEmail(),
    check("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ error: "Please use correct credentials to login" });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        success = false;
        return res
          .status(400)
          .json({ success, error: "Please use correct credentials to login" });
      }

      /* ADDING A JWT TOKEN TO VERIFY AUTHENTICATION */
      const data = {
        user: {
          id: user.id,
        },
      };
      const token = jwt.sign(data, process.env.JWT_SECRET); // Use the secret from .env
      success = true;
      res.json({ success, token });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error Occurred");
    }
  }
);

// ROUTE 3: Fetching logged in user's details: POST "/api/auth/getUser". login required
router.post("/getUser", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Error Occurred");
  }
});

module.exports = router;
