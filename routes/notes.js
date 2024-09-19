const express = require("express");
const router = express.Router();
/* importing fetchuser as our middle ware for the login user information */
var fetchUser = require("../middleware/fetchUser");

/* importing the schema model */
const Note = require("../models/Note");

/* Importing the Express Validator to ensure notes which are being added are not empty */
const { check, validationResult } = require("express-validator");

// ROUTE 1: Get All Note using : GET "/api/auth/fetchallnotes". login required
router.get("/fetchallnotes", fetchUser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error Occured");
  }
});
// ROUTE 2: Adding a new note using : POST "/api/auth/addnote". login required
router.post(
  "/addnote",
  fetchUser,
  [
    check("title", "Enter a valid title").isLength({ min: 3 }),
    check("description", "Description must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    const { title, description, tag } = req.body;
    /* IF USER INPUTS ARE INVALID ACCORDING TO THE VALIDATOR */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savednote = await note.save()

      res.json(savednote);

      const notes = await Note.find({ user: req.user.id });
      /* res.json(notes); */
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error Occured");
    }
  }
);
module.exports = router;
