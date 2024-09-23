require('dotenv').config();


const connectToMongo = require('./db')
const express = require('express')
var cors = require('cors')
connectToMongo();
const app = express()
const port = 5000

app.use(cors())
app.use(express.json())

/* middle-ware to use request.body */
app.use(express.json());

/* ALL ROUTES GO HERE : */
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))


app.listen(port, () => {
  console.log(`My-Diary listening on port: ${port}`)
})
