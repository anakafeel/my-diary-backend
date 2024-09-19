const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotesSchema = new Schema({
    /* to find out who is the user to show their notes */
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user' /* to store user */
    },
    title:{
        type: String,
        required: true
    },
    description:{
        type:String,
        required:true,
    },
    tag:{
        type:String,
        default: "General"
    }, 
    date:{
        type:Date,
        default: Date.now
    }

})

module.exports = mongoose.model('notes', NotesSchema);