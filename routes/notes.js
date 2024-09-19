const express = require("express");
const router = express.Router();
/* importing fetchuser as our middle ware for the login user information */
var fetchUser = require("../middleware/fetchUser");

/* importing the schema model */
const Note = require("../models/Note");

/* Importing the Express Validator to ensure notes which are being added are not empty */
const { check, validationResult } = require("express-validator");

// ROUTE 1: Get All Note using : GET "/api/notes/fetchallnotes". login required
router.get("/fetchallnotes", fetchUser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error Occured");
  }
});
// ROUTE 2: Adding a new note using : POST "/api/notes/addnote". login required
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
      const savednote = await note.save();

      res.json(savednote);

      const notes = await Note.find({ user: req.user.id });
      /* res.json(notes); */
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error Occured");
    }
  }
);

// ROUTE 3: Update a new note using : Put "/api/notes/updatenote". login required
router.put("/updatenote/:id", fetchUser, async (req, res) => {
  const { title, description, tag } = req.body;
  try {
    /* Creating a New Object */
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    /* Find the note to be update and then update it if necessary */
    /* FIRST CHECKING IF THE NOTE BELEONGS TO THE LOGGED IN USER */
    let note = await Note.findById(req.params.id);
    /* If note dosent exist */
    if (!note) {
      res.status(404).send("Not Found");
    }
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Applicable");
    }

    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error Occured");
  }
});
// ROUTE 4: Delete an existing note using : PUT "/api/notes/deletenote". login required
router.delete("/deletenote/:id", fetchUser, async (req, res) => {
  try {
    /* ONLY NEED TO VERIFY THAT THE PERSON DELETING THE NOTE IS THE REAL OWNER OF THE ACCOUNT */

    /* Find the note to be delete and then delete it if necessary */
    let note = await Note.findById(req.params.id);
    if (!note) {
      res.status(404).send("Not Found");
    }

    /* ONLY DELETE IF THE USER OWNS THE NOTE */
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Applicable");
    }

    note = await Note.findByIdAndDelete(req.params.id);
    res.json({ Success: "Note has been deleted" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error Occured");
  }
});

module.exports = router;
