const { check, validationResult } = require('express-validator');
const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
/* importing bcrypt.js for password hashing */
var bcrypt = require('bcryptjs');

// ROUTE 1: Create a User using: POST "/api/auth/createuser". No login required
router.post('/createuser', [
  check('name', 'Enter a valid name').isLength({ min: 3 }),
  check('email', 'Enter a valid email').isEmail(),
  check('password', 'Password must be at least 5 characters').isLength({ min: 5 }),
], async (req, res) => {
  /* THROWING ERRORS */
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    /* CHECKING IF USER ALREADY EXISTS - THROW ERROR*/
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ error: "Sorry, a user with this email already exists" });
    }

    /* ADDING SALT TO HASH PASS , (awaiting bcrypt as it returns a promise) */
    const salt =await bcrypt.genSalt(10);
    securedPass = await bcrypt.hash(req.body.password, salt);
    /* CREATE A USER IF THEY DONT EXIST */
    user = new User({
      name: req.body.name,
      email: req.body.email,
      password:  securedPass, 
    });

    /* SAVING TO DATABASE */
    await user.save();

    /* CATCHING ERRORS */
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
