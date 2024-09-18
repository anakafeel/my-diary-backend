const connectToMongo = require('./db')
const express = require('express')

connectToMongo();
const app = express()
const port = 3000


/* ALL ROUTES GO HERE : */
app.use('/api/auth', require('./routes/auth'))
app.use('/api/auth', require('./routes/notes'))


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
