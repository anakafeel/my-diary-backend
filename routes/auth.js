const { check, validationResult } = require("express-validator");
const express = require("express");
const router = express.Router();
const User = require("../models/User");
/* importing bcrypt.js for password hashing */
var bcrypt = require("bcryptjs");
/* importing JWT token for adding another layer of authentication - so that server provides correct persons data to the user */
var jwt = require("jsonwebtoken");

JWT_SECRET = "Saim$sMernApp";

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
    /* THROWING ERRORS */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      /* CHECKING IF USER ALREADY EXISTS - THROW ERROR*/
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ error: "Sorry, a user with this email already exists" });
      }

      /* ADDING SALT TO HASH PASS , (awaiting bcrypt as it returns a promise) */
      const salt = await bcrypt.genSalt(10);
      securedPass = await bcrypt.hash(req.body.password, salt);
      /* CREATE A USER IF THEY DONT EXIST */
      user = new User({
        name: req.body.name,
        email: req.body.email,
        password: securedPass,
      });

      /* SAVING TO DATABASE */
      await user.save();

      /* ADDING A JWT TOKEN TO VERIFY AUTHENTICATION - and sending the user their data */
      const data = {
        user: {
          id: user.id,
        },
      };
      const token = jwt.sign(data, JWT_SECRET);
      res.json({ token });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error Occured");
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
    /* THROWING ERRORS */
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
          .json({ error: "Please use correct password to login" });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res
          .status(400)
          .json({ error: "Please use correct password to login" });
      }

      /* ADDING A JWT TOKEN TO VERIFY AUTHENTICATION - and sending the user their data */
      const data = {
        user: {
          id: user.id,
        },
      };
      const token = jwt.sign(data, JWT_SECRET);
      res.json({ token });

    }catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error Occured");
      }
  }
);
module.exports = router;
