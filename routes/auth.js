const express = require('express');
const router = express.Router();

const User = require('../models/User')

/* Create a User Using: POST "/api/auth/", doesnt require auth */
router.post('/', (req,res)=>{
    res.send("hello");
    const user = User(req.body);
    user.save()
    res.send(req.body);
})
module.exports = router;