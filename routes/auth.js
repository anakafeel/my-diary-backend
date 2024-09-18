const { check, validationResult } = require('express-validator');
const express = require('express');
const router = express.Router();
const User = require('../models/User'); 

// ROUTE 1: Create a User using: POST "/api/auth/". No login required
router.post('/', [
  check('name', 'Enter a valid name').isLength({ min: 3 }),
  check('email', 'Enter a valid email').isEmail(),
  check('password', 'Password must be at least 5 characters').isLength({ min: 5 }),
], async (req, res) => {
  /* FOR ERRORS */
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

    /* CREATE A USER IF THEY DONT EXIST */
    user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password, // Consider hashing the password before saving
    });

    /* SAVING TO DATABASE */
    await user.save();

    // Respond with the new user (you might want to omit the password in the response)
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
